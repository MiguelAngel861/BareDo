"""Tests for Phase 2 — validation and write semantics.

Covers: CRIT-003, CRIT-004, CRIT-005, HIGH-006.
"""


def _create_task(client, title="Test task"):
    resp = client.post(
        "/api/v1/tasks",
        json={"title": title, "description": "desc", "priority": 1},
    )
    return resp.get_json()


class TestPostValidation:
    """HIGH-006: POST must validate input bodies safely."""

    def test_empty_body_returns_400(self, client):
        resp = client.post("/api/v1/tasks", json={})
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["error"]["code"] == "BAD_REQUEST"

    def test_missing_title_returns_400(self, client):
        resp = client.post("/api/v1/tasks", json={"description": "no title"})
        assert resp.status_code == 400

    def test_title_too_short_returns_400(self, client):
        resp = client.post("/api/v1/tasks", json={"title": "ab"})
        assert resp.status_code == 400

    def test_title_too_long_returns_400(self, client):
        resp = client.post("/api/v1/tasks", json={"title": "x" * 41})
        assert resp.status_code == 400

    def test_priority_out_of_range_returns_400(self, client):
        resp = client.post(
            "/api/v1/tasks", json={"title": "valid title", "priority": 5}
        )
        assert resp.status_code == 400

    def test_non_json_body_returns_400(self, client):
        resp = client.post(
            "/api/v1/tasks",
            data="not json",
            content_type="text/plain",
        )
        assert resp.status_code == 400

    def test_valid_body_returns_201(self, client):
        resp = client.post(
            "/api/v1/tasks",
            json={"title": "Valid task", "description": "ok", "priority": 2},
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["title"] == "Valid task"


class TestPutValidation:
    """CRIT-004: PUT must validate and return 400 on bad payload."""

    def test_put_empty_body_returns_400(self, client):
        task = _create_task(client, title="Put target")
        task_id = task["task_id"]
        resp = client.put(f"/api/v1/tasks/{task_id}", json={})
        assert resp.status_code == 400

    def test_put_missing_required_field_returns_400(self, client):
        task = _create_task(client, title="Put target")
        task_id = task["task_id"]
        resp = client.put(
            f"/api/v1/tasks/{task_id}",
            json={"title": "ok"},
        )
        assert resp.status_code == 400

    def test_put_valid_body_returns_200(self, client):
        task = _create_task(client, title="Put target")
        task_id = task["task_id"]
        resp = client.put(
            f"/api/v1/tasks/{task_id}",
            json={
                "title": "Updated title",
                "description": "updated",
                "priority": 3,
                "completed": True,
                "due_date": "2026-12-31T23:59:59",
            },
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["title"] == "Updated title"
        assert data["completed"] is True


class TestPatchSemantics:
    """CRIT-003: PATCH must use exclude_unset, not overwrite with None.
    CRIT-005: PATCH validation must return 400, not 500.
    """

    def test_patch_single_field_only(self, client):
        task = _create_task(client, title="Patch me")
        task_id = task["task_id"]
        original_desc = task["description"]

        resp = client.patch(
            f"/api/v1/tasks/{task_id}",
            json={"completed": True},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["completed"] is True
        assert data["description"] == original_desc

    def test_patch_does_not_overwrite_with_none(self, client):
        task = _create_task(client, title="No overwrite")
        task_id = task["task_id"]

        resp = client.patch(
            f"/api/v1/tasks/{task_id}",
            json={"priority": 2},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["title"] == "No overwrite"
        assert data["priority"] == 2
        assert data["description"] == task["description"]

    def test_patch_empty_body_is_noop(self, client):
        task = _create_task(client, title="Empty patch")
        task_id = task["task_id"]
        resp = client.patch(f"/api/v1/tasks/{task_id}", json={})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["title"] == "Empty patch"

    def test_patch_invalid_type_returns_400(self, client):
        task = _create_task(client, title="Bad patch")
        task_id = task["task_id"]
        resp = client.patch(
            f"/api/v1/tasks/{task_id}",
            json={"priority": "not_a_number"},
        )
        assert resp.status_code == 400


class TestNotFoundError:
    """NotFoundError must return 404, not 500."""

    def test_get_nonexistent_returns_404(self, client):
        resp = client.get("/api/v1/tasks/99999")
        assert resp.status_code == 404

    def test_put_nonexistent_returns_404(self, client):
        resp = client.put(
            "/api/v1/tasks/99999",
            json={
                "title": "Ghost",
                "description": "",
                "priority": 1,
                "completed": False,
                "due_date": "2026-01-01T00:00:00",
            },
        )
        assert resp.status_code == 404

    def test_patch_nonexistent_returns_404(self, client):
        resp = client.patch("/api/v1/tasks/99999", json={"title": "Ghost"})
        assert resp.status_code == 404

    def test_delete_nonexistent_returns_404(self, client):
        resp = client.delete("/api/v1/tasks/99999")
        assert resp.status_code == 404


class TestErrorResponseFormat:
    """All errors must follow the same envelope."""

    def test_error_has_required_fields(self, client):
        resp = client.post("/api/v1/tasks", json={})
        data = resp.get_json()
        assert "error" in data
        for key in ("code", "message", "status"):
            assert key in data["error"]

    def test_not_found_error_format(self, client):
        resp = client.get("/api/v1/tasks/99999")
        data = resp.get_json()
        assert data["error"]["code"] == "NOT_FOUND"
        assert data["error"]["status"] == 404
