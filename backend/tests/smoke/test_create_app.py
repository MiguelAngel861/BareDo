def test_create_app(app):
    assert app is not None
    assert app.config["TESTING"] is True


def test_health_endpoint(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "healthy"
    assert data["service"] == "bare-do-api"
