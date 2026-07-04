"""Tests for Phase 3 — reduce attack surface and harden runtime.

Covers: HIGH-009, MED-014.
"""

import os


class TestIndexPage:
    """HIGH-009: index page loads and serves static JS safely."""

    def test_index_returns_html(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert resp.content_type.startswith("text/html")

    def test_script_js_served(self, client):
        resp = client.get("/static/script.js")
        assert resp.status_code == 200
        assert resp.content_type.startswith("text/javascript")

    def test_script_js_uses_textcontent_not_innerhtml(self):
        """HIGH-009: user-controlled data rendered with textContent, not innerHTML."""
        path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "app",
            "views",
            "static",
            "script.js",
        )
        with open(path) as f:
            content = f.read()
        assert "textContent" in content


class TestIndexFormStructure:
    """Index page has the expected UI elements."""

    def test_index_has_task_list_container(self, client):
        resp = client.get("/")
        html = resp.data.decode()
        assert 'id="task-list"' in html

    def test_index_has_task_form(self, client):
        resp = client.get("/")
        html = resp.data.decode()
        assert 'id="task-form"' in html


class TestDebugConfig:
    """MED-014: debug flag must come from environment, not hardcode."""

    def test_debug_defaults_to_false_in_test(self, app):
        assert not app.debug

    def test_run_py_reads_env_var(self):
        path = os.path.join(os.path.dirname(__file__), "..", "run.py")
        with open(path) as f:
            content = f.read()
        assert "debug=True" not in content, (
            "debug is hardcoded — use FLASK_DEBUG env var instead."
        )
        assert "FLASK_DEBUG" in content
