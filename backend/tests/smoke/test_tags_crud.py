def test_tags_require_auth(client):
    assert client.get("/api/v1/tags").status_code == 401
    assert client.post("/api/v1/tags", json={"name": "test"}).status_code == 401
    assert client.delete("/api/v1/tags/1").status_code == 401


def test_list_tags_initially_empty(client, auth_headers):
    headers, _ = auth_headers
    resp = client.get("/api/v1/tags", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data == {"tags": []}


def test_create_tag_success(client, auth_headers):
    headers, _ = auth_headers
    resp = client.post("/api/v1/tags", json={"name": "backend"}, headers=headers)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["name"] == "backend"
    assert "tag_id" in data


def test_create_tag_duplicate_returns_409(client, auth_headers):
    headers, _ = auth_headers
    client.post("/api/v1/tags", json={"name": "urgent"}, headers=headers)
    resp = client.post("/api/v1/tags", json={"name": "URGENT"}, headers=headers)
    assert resp.status_code == 409


def test_delete_tag_success(client, auth_headers):
    headers, _ = auth_headers
    created = client.post("/api/v1/tags", json={"name": "temp"}, headers=headers).get_json()
    tag_id = created["tag_id"]

    del_resp = client.delete(f"/api/v1/tags/{tag_id}", headers=headers)
    assert del_resp.status_code == 204

    list_resp = client.get("/api/v1/tags", headers=headers).get_json()
    assert len(list_resp["tags"]) == 0


def test_delete_tag_not_found(client, auth_headers):
    headers, _ = auth_headers
    resp = client.delete("/api/v1/tags/999", headers=headers)
    assert resp.status_code == 404


def test_create_and_filter_tasks_with_tags(client, auth_headers):
    headers, _ = auth_headers
    tag1 = client.post("/api/v1/tags", json={"name": "work"}, headers=headers).get_json()
    tag2 = client.post("/api/v1/tags", json={"name": "home"}, headers=headers).get_json()

    # Create task with tag1
    task1_resp = client.post(
        "/api/v1/tasks",
        json={"title": "Task One Work", "tag_ids": [tag1["tag_id"]]},
        headers=headers,
    )
    assert task1_resp.status_code == 201
    task1 = task1_resp.get_json()
    assert len(task1["tags"]) == 1
    assert task1["tags"][0]["name"] == "work"

    # Create task with tag2
    task2_resp = client.post(
        "/api/v1/tasks",
        json={"title": "Task Two Home", "tag_ids": [tag2["tag_id"]]},
        headers=headers,
    )
    assert task2_resp.status_code == 201

    # Filter tasks by tag1
    filter_resp = client.get(f"/api/v1/tasks?tag_ids={tag1['tag_id']}", headers=headers)
    assert filter_resp.status_code == 200
    filtered_tasks = filter_resp.get_json()["tasks"]
    assert len(filtered_tasks) == 1
    assert filtered_tasks[0]["title"] == "Task One Work"

    # Filter tasks by both tags (OR)
    filter_both = client.get(
        f"/api/v1/tasks?tag_ids={tag1['tag_id']},{tag2['tag_id']}", headers=headers
    )
    assert filter_both.status_code == 200
    assert len(filter_both.get_json()["tasks"]) == 2

    # Update task1 to have both tags
    update_resp = client.put(
        f"/api/v1/tasks/{task1['task_id']}",
        json={
            "title": "Task One Updated",
            "due_date": task1["due_date"],
            "completed": False,
            "tag_ids": [tag1["tag_id"], tag2["tag_id"]],
        },
        headers=headers,
    )
    assert update_resp.status_code == 200
    updated_task = update_resp.get_json()
    assert len(updated_task["tags"]) == 2
