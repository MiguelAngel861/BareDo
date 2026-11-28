import pytest

from app import create_app


def test_create_app(app):
    assert app is not None
    assert app.config["TESTING"] is True


def test_health_endpoint(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "healthy"
    assert data["service"] == "bare-do-api"


def test_health_endpoint_reports_down_when_database_fails(client, monkeypatch):
    from sqlalchemy.exc import OperationalError

    class _BrokenSession:
        def execute(self, *args, **kwargs):
            raise OperationalError("SELECT 1", {}, Exception("connection refused"))

    class _BrokenDB:
        session = _BrokenSession()

    monkeypatch.setattr("app.api.v1.routes.health.db", _BrokenDB())
    resp = client.get("/health")
    assert resp.status_code == 503
    assert resp.get_json()["status"] == "unhealthy"


def test_create_app_production_requires_secret_key(monkeypatch):
    monkeypatch.delenv("SECRET_KEY", raising=False)
    monkeypatch.setenv("JWT_SECRET_KEY", "prod-jwt")
    monkeypatch.setenv("CORS_ORIGINS", "https://example.com")
    monkeypatch.setenv("RATELIMIT_STORAGE_URI", "memory://")
    with pytest.raises(RuntimeError, match="SECRET_KEY must be set in production"):
        create_app("production")


def test_create_app_production_requires_jwt_secret_key(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "prod-secret")
    monkeypatch.delenv("JWT_SECRET_KEY", raising=False)
    monkeypatch.setenv("CORS_ORIGINS", "https://example.com")
    monkeypatch.setenv("RATELIMIT_STORAGE_URI", "memory://")
    with pytest.raises(RuntimeError, match="JWT_SECRET_KEY must be set in production"):
        create_app("production")


def test_create_app_production_requires_cors_origins(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "prod-secret")
    monkeypatch.setenv("JWT_SECRET_KEY", "prod-jwt")
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    with pytest.raises(RuntimeError, match="CORS_ORIGINS must be set in production"):
        create_app("production")


def test_create_app_production_requires_ratelimit_storage_uri(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "prod-secret")
    monkeypatch.setenv("JWT_SECRET_KEY", "prod-jwt")
    monkeypatch.setenv("CORS_ORIGINS", "https://example.com")
    monkeypatch.delenv("RATELIMIT_STORAGE_URI", raising=False)
    with pytest.raises(RuntimeError, match="RATELIMIT_STORAGE_URI must be set in production"):
        create_app("production")
