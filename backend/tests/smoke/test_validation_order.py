"""Verifica que la autenticacion JWT corre ANTES de la validacion de Pydantic.

Con @validate_request (validacion diferida), una peticion sin token con body
invalido debe responder 401 (auth) y no 422 (validacion).
"""


def test_no_token_invalid_body_returns_401(client):
    resp = client.post("/api/v1/tasks", json={"title": ""})
    assert resp.status_code == 401


def test_invalid_token_invalid_body_returns_401(client):
    resp = client.post(
        "/api/v1/tasks",
        json={"title": ""},
        headers={"Authorization": "Bearer invalido"},
    )
    assert resp.status_code == 401


def test_no_token_invalid_query_returns_401(client):
    resp = client.get("/api/v1/tasks?page=0&per_page=999")
    assert resp.status_code == 401


def test_valid_token_invalid_body_returns_422(client, auth_headers):
    headers, _ = auth_headers
    resp = client.post("/api/v1/tasks", json={"title": ""}, headers=headers)
    assert resp.status_code == 422


def test_valid_token_valid_body_returns_201(client, auth_headers):
    headers, _ = auth_headers
    resp = client.post(
        "/api/v1/tasks",
        json={"title": "Nueva tarea"},
        headers=headers,
    )
    assert resp.status_code == 201
