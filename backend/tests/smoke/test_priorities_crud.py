def test_list_priorities(client, auth_headers):
    headers, user_id = auth_headers
    resp = client.get("/api/v1/priorities", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert "priorities" in data
    assert len(data["priorities"]) == 5


def test_list_priorities_sorted_by_level(client, auth_headers):
    headers, user_id = auth_headers
    resp = client.get("/api/v1/priorities", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    levels = [p["level"] for p in data["priorities"]]
    assert levels == [1, 2, 3, 4, 5]


def test_list_priorities_has_required_fields(client, auth_headers):
    headers, user_id = auth_headers
    resp = client.get("/api/v1/priorities", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    for priority in data["priorities"]:
        assert "priority_id" in priority
        assert "name" in priority
        assert "level" in priority
        assert "description" in priority


def test_priorities_require_auth(client):
    resp = client.get("/api/v1/priorities")
    assert resp.status_code == 401


def test_create_task_with_valid_priority_id(client, auth_headers):
    headers, user_id = auth_headers
    resp = client.post(
        "/api/v1/tasks",
        json={
            "title": "Task with priority",
            "priority_id": 5,
            "due_date": "2026-12-31",
        },
        headers=headers,
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["priority_id"] == 5


def test_create_task_with_invalid_priority_id(client, auth_headers):
    headers, user_id = auth_headers
    resp = client.post(
        "/api/v1/tasks",
        json={
            "title": "Task with invalid priority",
            "priority_id": 99,
            "due_date": "2026-12-31",
        },
        headers=headers,
    )
    assert resp.status_code == 422


def test_filter_tasks_by_priority_id(client, auth_headers, make_task):
    headers, user_id = auth_headers
    make_task(user_id, title="Low task", priority_id=1)
    make_task(user_id, title="High task", priority_id=5)

    resp = client.get("/api/v1/tasks?priority_id=5", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data["tasks"]) == 1
    assert data["tasks"][0]["title"] == "High task"
    assert data["tasks"][0]["priority_id"] == 5


def test_sort_tasks_by_priority(client, auth_headers, make_task):
    headers, user_id = auth_headers
    make_task(user_id, title="Low priority task", priority_id=1)
    make_task(user_id, title="High priority task", priority_id=5)
    make_task(user_id, title="Medium priority task", priority_id=3)

    resp = client.get("/api/v1/tasks?sort=-priority", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data["tasks"]) == 3
    assert data["tasks"][0]["priority_id"] == 5
    assert data["tasks"][1]["priority_id"] == 3
    assert data["tasks"][2]["priority_id"] == 1
