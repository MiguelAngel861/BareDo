def test_create_and_get_subtask(client, auth_headers, make_task):
    headers, user_id = auth_headers
    task = make_task(user_id, title="Task with subtasks")

    resp = client.post(
        f"/api/v1/tasks/{task.task_id}/subtasks",
        json={"title": "Step 1", "completed": False},
        headers=headers,
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["title"] == "Step 1"
    assert data["completed"] is False
    assert data["task_id"] == task.task_id
    subtask_id = data["subtask_id"]

    # Verify task GET contains the subtask
    resp_task = client.get(f"/api/v1/tasks/{task.task_id}", headers=headers)
    assert resp_task.status_code == 200
    task_data = resp_task.get_json()
    assert len(task_data["subtasks"]) == 1
    assert task_data["subtasks"][0]["subtask_id"] == subtask_id

    # Verify subtasks GET route
    resp_list = client.get(f"/api/v1/tasks/{task.task_id}/subtasks", headers=headers)
    assert resp_list.status_code == 200
    assert len(resp_list.get_json()["subtasks"]) == 1


def test_patch_subtask(client, auth_headers, make_task):
    headers, user_id = auth_headers
    task = make_task(user_id, title="Task to patch subtask")

    resp = client.post(
        f"/api/v1/tasks/{task.task_id}/subtasks",
        json={"title": "Step 1"},
        headers=headers,
    )
    subtask_id = resp.get_json()["subtask_id"]

    resp_patch = client.patch(
        f"/api/v1/tasks/{task.task_id}/subtasks/{subtask_id}",
        json={"completed": True, "title": "Step 1 Updated"},
        headers=headers,
    )
    assert resp_patch.status_code == 200
    data = resp_patch.get_json()
    assert data["completed"] is True
    assert data["title"] == "Step 1 Updated"


def test_delete_subtask(client, auth_headers, make_task):
    headers, user_id = auth_headers
    task = make_task(user_id, title="Task to delete subtask")

    resp = client.post(
        f"/api/v1/tasks/{task.task_id}/subtasks",
        json={"title": "Temporary step"},
        headers=headers,
    )
    subtask_id = resp.get_json()["subtask_id"]

    resp_del = client.delete(
        f"/api/v1/tasks/{task.task_id}/subtasks/{subtask_id}",
        headers=headers,
    )
    assert resp_del.status_code == 204

    resp_list = client.get(f"/api/v1/tasks/{task.task_id}/subtasks", headers=headers)
    assert resp_list.status_code == 200
    assert len(resp_list.get_json()["subtasks"]) == 0


def test_create_task_with_initial_subtasks(client, auth_headers):
    headers, _ = auth_headers
    resp = client.post(
        "/api/v1/tasks",
        json={
            "title": "Task with initial subtasks",
            "subtasks": [
                {"title": "Subtask A", "completed": False},
                {"title": "Subtask B", "completed": True},
            ],
        },
        headers=headers,
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert len(data["subtasks"]) == 2
    assert data["subtasks"][0]["title"] == "Subtask A"
    assert data["subtasks"][0]["completed"] is False
    assert data["subtasks"][1]["title"] == "Subtask B"
    assert data["subtasks"][1]["completed"] is True
