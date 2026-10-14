from sqlalchemy import text

from app.core.extensions import db


def test_soft_delete_and_list_trash(client, auth_headers, make_task):
    headers, user_id = auth_headers
    t1 = make_task(user_id, title="Active Task")
    t2 = make_task(user_id, title="Trashed Task")

    # Count trash before
    resp = client.get("/api/v1/tasks/trash/count", headers=headers)
    assert resp.status_code == 200
    assert resp.get_json()["count"] == 0

    # Soft delete t2
    del_resp = client.delete(f"/api/v1/tasks/{t2.task_id}", headers=headers)
    assert del_resp.status_code == 204

    # Active tasks list must only have t1
    active_resp = client.get("/api/v1/tasks", headers=headers)
    assert active_resp.status_code == 200
    active_tasks = active_resp.get_json()["tasks"]
    assert len(active_tasks) == 1
    assert active_tasks[0]["task_id"] == t1.task_id

    # Getting t2 directly via active endpoint returns 404
    get_resp = client.get(f"/api/v1/tasks/{t2.task_id}", headers=headers)
    assert get_resp.status_code == 404

    # Trash count is now 1
    count_resp = client.get("/api/v1/tasks/trash/count", headers=headers)
    assert count_resp.status_code == 200
    assert count_resp.get_json()["count"] == 1

    # Trash list returns t2
    trash_resp = client.get("/api/v1/tasks/trash", headers=headers)
    assert trash_resp.status_code == 200
    trash_data = trash_resp.get_json()
    assert len(trash_data["tasks"]) == 1
    assert trash_data["tasks"][0]["task_id"] == t2.task_id
    assert trash_data["tasks"][0]["deleted_at"] is not None


def test_restore_task_preserves_tags(client, auth_headers):
    headers, _ = auth_headers
    tag = client.post("/api/v1/tags", json={"name": "restore-tag"}, headers=headers).get_json()
    task = client.post(
        "/api/v1/tasks",
        json={"title": "Tag Task", "tag_ids": [tag["tag_id"]]},
        headers=headers,
    ).get_json()
    task_id = task["task_id"]

    # Delete task (soft delete)
    assert client.delete(f"/api/v1/tasks/{task_id}", headers=headers).status_code == 204

    # Association in task_tags is preserved
    count = db.session.execute(
        text("SELECT COUNT(*) FROM task_tags WHERE task_id = :task_id"), {"task_id": task_id}
    ).scalar()
    assert count == 1

    # Restore task
    restore_resp = client.post(f"/api/v1/tasks/{task_id}/restore", headers=headers)
    assert restore_resp.status_code == 200
    restored = restore_resp.get_json()
    assert restored["task_id"] == task_id
    assert restored["deleted_at"] is None
    assert len(restored["tags"]) == 1
    assert restored["tags"][0]["name"] == "restore-tag"

    # Now it appears in active tasks
    active_resp = client.get("/api/v1/tasks", headers=headers)
    assert any(t["task_id"] == task_id for t in active_resp.get_json()["tasks"])


def test_permanent_delete_task(client, auth_headers):
    headers, _ = auth_headers
    tag = client.post("/api/v1/tags", json={"name": "perm-tag"}, headers=headers).get_json()
    task = client.post(
        "/api/v1/tasks",
        json={"title": "Perm Task", "tag_ids": [tag["tag_id"]]},
        headers=headers,
    ).get_json()
    task_id = task["task_id"]

    # Soft delete first
    client.delete(f"/api/v1/tasks/{task_id}", headers=headers)

    # Permanent delete
    perm_resp = client.delete(f"/api/v1/tasks/{task_id}/permanent", headers=headers)
    assert perm_resp.status_code == 204

    # Now hard deleted: row is completely gone
    task_count = db.session.execute(
        text("SELECT COUNT(*) FROM tasks WHERE task_id = :task_id"), {"task_id": task_id}
    ).scalar()
    assert task_count == 0

    # Association is cascaded
    tag_assoc_count = db.session.execute(
        text("SELECT COUNT(*) FROM task_tags WHERE task_id = :task_id"), {"task_id": task_id}
    ).scalar()
    assert tag_assoc_count == 0


def test_empty_trash(client, auth_headers, make_task):
    headers, user_id = auth_headers
    t1 = make_task(user_id, title="Trash 1")
    t2 = make_task(user_id, title="Trash 2")
    t3 = make_task(user_id, title="Keep Active")

    client.delete(f"/api/v1/tasks/{t1.task_id}", headers=headers)
    client.delete(f"/api/v1/tasks/{t2.task_id}", headers=headers)

    count_resp = client.get("/api/v1/tasks/trash/count", headers=headers)
    assert count_resp.get_json()["count"] == 2

    # Empty trash
    empty_resp = client.delete("/api/v1/tasks/trash", headers=headers)
    assert empty_resp.status_code == 204

    # Count is 0
    assert client.get("/api/v1/tasks/trash/count", headers=headers).get_json()["count"] == 0

    # t3 is still in active tasks
    active_resp = client.get("/api/v1/tasks", headers=headers)
    assert len(active_resp.get_json()["tasks"]) == 1
    assert active_resp.get_json()["tasks"][0]["task_id"] == t3.task_id


def test_trash_user_isolation(client, auth_headers, make_user, make_task):
    headers1, user1_id = auth_headers
    u2 = make_user(username="user2")

    # Create task for user 2
    t2 = make_task(u2.user_id, title="User2 Trashed Task")
    # Soft delete t2 in DB directly
    db.session.execute(
        text("UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP WHERE task_id = :task_id"),
        {"task_id": t2.task_id},
    )
    db.session.commit()

    # User 1 has no trash
    resp = client.get("/api/v1/tasks/trash", headers=headers1)
    assert len(resp.get_json()["tasks"]) == 0

    # User 1 cannot restore User 2's task
    assert client.post(f"/api/v1/tasks/{t2.task_id}/restore", headers=headers1).status_code == 404

    # User 1 cannot permanent-delete User 2's task
    del_resp = client.delete(f"/api/v1/tasks/{t2.task_id}/permanent", headers=headers1)
    assert del_resp.status_code == 404

    # User 1 empty trash does not delete User 2's task
    client.delete("/api/v1/tasks/trash", headers=headers1)
    t2_count = db.session.execute(
        text("SELECT COUNT(*) FROM tasks WHERE task_id = :task_id"), {"task_id": t2.task_id}
    ).scalar()
    assert t2_count == 1
