def test_create_task(client, auth_headers):
    headers, user_id = auth_headers
    resp = client.post(
        "/api/v1/tasks",
        json={
            "title": "New Task",
            "description": "Task description",
            "priority": 2,
            "due_date": "2026-12-31",
        },
        headers=headers,
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["title"] == "New Task"
    assert data["description"] == "Task description"
    assert data["priority"] == 2
    assert data["completed"] is False
    assert "task_id" in data


def test_create_task_minimal(client, auth_headers):
    headers, user_id = auth_headers
    resp = client.post(
        "/api/v1/tasks",
        json={"title": "Minimal Task"},
        headers=headers,
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["title"] == "Minimal Task"
    assert data["description"] == ""
    assert data["priority"] == 1


def test_list_tasks(client, auth_headers, make_task):
    headers, user_id = auth_headers
    make_task(user_id, title="Task 1")
    make_task(user_id, title="Task 2")
    resp = client.get("/api/v1/tasks", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data["tasks"]) == 2


def test_get_task(client, auth_headers, make_task):
    headers, user_id = auth_headers
    task = make_task(user_id, title="Single Task")
    resp = client.get(f"/api/v1/tasks/{task.task_id}", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["title"] == "Single Task"
    assert data["task_id"] == task.task_id


def test_get_task_not_found(client, auth_headers):
    headers, user_id = auth_headers
    resp = client.get("/api/v1/tasks/999999", headers=headers)
    assert resp.status_code == 404


def test_update_task(client, auth_headers, make_task):
    headers, user_id = auth_headers
    task = make_task(user_id, title="Original", completed=False)
    resp = client.patch(
        f"/api/v1/tasks/{task.task_id}",
        json={"title": "Updated", "completed": True},
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["title"] == "Updated"
    assert data["completed"] is True


def test_update_task_not_found(client, auth_headers):
    headers, user_id = auth_headers
    resp = client.patch(
        "/api/v1/tasks/999999",
        json={"title": "Updated"},
        headers=headers,
    )
    assert resp.status_code == 404


def test_delete_task(client, auth_headers, make_task):
    headers, user_id = auth_headers
    task = make_task(user_id, title="To Delete")
    resp = client.delete(f"/api/v1/tasks/{task.task_id}", headers=headers)
    assert resp.status_code == 204

    resp = client.get(f"/api/v1/tasks/{task.task_id}", headers=headers)
    assert resp.status_code == 404


def test_delete_task_not_found(client, auth_headers):
    headers, user_id = auth_headers
    resp = client.delete("/api/v1/tasks/999999", headers=headers)
    assert resp.status_code == 404


def test_tasks_require_auth(client):
    resp = client.get("/api/v1/tasks")
    assert resp.status_code == 401

    resp = client.post("/api/v1/tasks", json={"title": "Test"})
    assert resp.status_code == 401


def test_create_task_validation_error(client, auth_headers):
    """Test validation error format for create task."""
    headers, _ = auth_headers
    resp = client.post(
        "/api/v1/tasks",
        json={"title": "ab", "priority": 99},
        headers=headers,
    )
    assert resp.status_code == 422
    data = resp.get_json()
    assert data["code"] == "VALIDATION_ERROR"
    assert "body_params" in data["details"]
    body_errors = data["details"]["body_params"]
    locs = [e["loc"][0] for e in body_errors]
    assert "title" in locs  # min_length
    assert "priority" in locs  # le=3


def test_update_task_validation_error(client, auth_headers, make_task):
    """Test validation error format for update task."""
    headers, user_id = auth_headers
    task = make_task(user_id, title="Original")
    resp = client.put(
        f"/api/v1/tasks/{task.task_id}",
        json={"title": "ab", "completed": True, "due_date": "2026-12-31"},
        headers=headers,
    )
    assert resp.status_code == 422
    data = resp.get_json()
    assert data["code"] == "VALIDATION_ERROR"
    assert "body_params" in data["details"]


def test_patch_task_validation_error(client, auth_headers, make_task):
    """Test validation error format for patch task."""
    headers, user_id = auth_headers
    task = make_task(user_id, title="Original")
    resp = client.patch(
        f"/api/v1/tasks/{task.task_id}",
        json={"priority": 99},
        headers=headers,
    )
    assert resp.status_code == 422
    data = resp.get_json()
    assert data["code"] == "VALIDATION_ERROR"
    assert "body_params" in data["details"]


def test_tasks_query_validation_error(client, auth_headers):
    """Test validation error format for query params in tasks list."""
    headers, _ = auth_headers
    resp = client.get("/api/v1/tasks?page=invalid&per_page=abc", headers=headers)
    assert resp.status_code == 422
    data = resp.get_json()
    assert data["code"] == "VALIDATION_ERROR"
    assert "query_params" in data["details"]
    query_errors = data["details"]["query_params"]
    locs = [e["loc"][0] for e in query_errors]
    assert "page" in locs
    assert "per_page" in locs
