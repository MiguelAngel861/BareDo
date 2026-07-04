"""Tests for Phase 1 — reliable data reading.

Covers: CRIT-001, CRIT-002, HIGH-007, HIGH-008, MED-011, MED-012.
"""


class TestPaginationMetadata:
    """CRIT-001: total count before pagination.
    CRIT-002: total_pages calculated from per_page, not total_tasks.
    HIGH-008: real metadata and 200 status.
    """

    def test_total_reflects_all_rows_not_just_page(self, client, seed_tasks):
        resp = client.get("/api/v1/tasks?page=1&per_page=5")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["meta"]["total"] == 15
        assert len(data["tasks"]) == 5

    def test_total_pages_formula(self, client, seed_tasks):
        resp = client.get("/api/v1/tasks?page=1&per_page=10")
        data = resp.get_json()
        assert data["meta"]["total"] == 15
        assert data["meta"]["total_pages"] == 2

    def test_page2_returns_remaining(self, client, seed_tasks):
        resp = client.get("/api/v1/tasks?page=2&per_page=10")
        data = resp.get_json()
        assert len(data["tasks"]) == 5
        assert data["meta"]["page"] == 2

    def test_last_page_partial(self, client, seed_tasks):
        resp = client.get("/api/v1/tasks?page=3&per_page=7")
        data = resp.get_json()
        assert len(data["tasks"]) == 1
        assert data["meta"]["total_pages"] == 3

    def test_status_code_is_200(self, client, seed_tasks):
        resp = client.get("/api/v1/tasks")
        assert resp.status_code == 200


class TestEmptyList:
    """HIGH-007: empty collection returns stable contract."""

    def test_empty_list_returns_200(self, client):
        resp = client.get("/api/v1/tasks")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["tasks"] == []
        assert data["meta"]["total"] == 0
        assert data["meta"]["total_pages"] == 0

    def test_empty_list_has_valid_envelope(self, client):
        resp = client.get("/api/v1/tasks")
        data = resp.get_json()
        assert "tasks" in data
        assert "meta" in data
        for key in ("total", "page", "per_page", "total_pages"):
            assert key in data["meta"]


class TestCompletedFilter:
    """MED-011: completed=false filter preserves False as valid value."""

    def test_filter_completed_true(self, client, seed_tasks):
        resp = client.get("/api/v1/tasks?completed=true")
        data = resp.get_json()
        assert all(t["completed"] is True for t in data["tasks"])
        assert data["meta"]["total"] > 0

    def test_filter_completed_false(self, client, seed_tasks):
        resp = client.get("/api/v1/tasks?completed=false")
        data = resp.get_json()
        assert all(t["completed"] is False for t in data["tasks"])
        assert data["meta"]["total"] > 0

    def test_completed_false_not_ignored(self, client):
        """Create one completed=false task, verify it shows up."""
        client.post(
            "/api/v1/tasks",
            json={"title": "Pending task", "completed": False},
        )
        resp = client.get("/api/v1/tasks?completed=false")
        data = resp.get_json()
        assert data["meta"]["total"] >= 1
        assert any(t["title"] == "Pending task" for t in data["tasks"])


class TestQueryParamsValidation:
    """MED-012: page and per_page must have sane limits."""

    def test_page_zero_rejected(self, client):
        resp = client.get("/api/v1/tasks?page=0")
        assert resp.status_code == 400

    def test_negative_page_rejected(self, client):
        resp = client.get("/api/v1/tasks?page=-1")
        assert resp.status_code == 400

    def test_per_page_zero_rejected(self, client):
        resp = client.get("/api/v1/tasks?per_page=0")
        assert resp.status_code == 400

    def test_per_page_over_100_rejected(self, client):
        resp = client.get("/api/v1/tasks?per_page=101")
        assert resp.status_code == 400

    def test_per_page_100_accepted(self, client):
        resp = client.get("/api/v1/tasks?per_page=100")
        assert resp.status_code == 200

    def test_per_page_1_accepted(self, client, seed_tasks):
        resp = client.get("/api/v1/tasks?per_page=1")
        data = resp.get_json()
        assert len(data["tasks"]) == 1


class TestEnvelopeContract:
    """Response envelope is always consistent."""

    def test_envelope_structure(self, client, seed_tasks):
        resp = client.get("/api/v1/tasks")
        data = resp.get_json()
        assert isinstance(data["tasks"], list)
        assert isinstance(data["meta"], dict)
        assert isinstance(data["meta"]["total"], int)
        assert isinstance(data["meta"]["page"], int)
        assert isinstance(data["meta"]["per_page"], int)
        assert isinstance(data["meta"]["total_pages"], int)

    def test_task_body_fields(self, client, seed_tasks):
        resp = client.get("/api/v1/tasks?per_page=1")
        data = resp.get_json()
        task = data["tasks"][0]
        for field in (
            "task_id",
            "title",
            "description",
            "priority",
            "completed",
            "due_date",
            "created_at",
            "updated_at",
        ):
            assert field in task
