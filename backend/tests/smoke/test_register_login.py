def test_register_user(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={"username": "newuser", "password": "Password123!"},
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["username"] == "newuser"
    assert "password_hash" not in data["user"]


def test_register_duplicate_username(client):
    client.post(
        "/api/v1/auth/register",
        json={"username": "dupuser", "password": "Password123!"},
    )
    resp = client.post(
        "/api/v1/auth/register",
        json={"username": "dupuser", "password": "Password123!"},
    )
    # Duplicate username returns 409 Conflict with a friendly message
    assert resp.status_code == 409
    data = resp.get_json()
    assert data["code"] == "CONFLICT"
    assert data["message"] == "Username already in use"


def test_login_success(client):
    client.post(
        "/api/v1/auth/register",
        json={"username": "loginuser", "password": "Password123!"},
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"username": "loginuser", "password": "Password123!"},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["username"] == "loginuser"


def test_login_wrong_password(client):
    client.post(
        "/api/v1/auth/register",
        json={"username": "loginuser2", "password": "Password123!"},
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"username": "loginuser2", "password": "Wrongpass1!"},
    )
    assert resp.status_code == 401


def test_login_nonexistent_user(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"username": "nonexistent", "password": "password123"},
    )
    assert resp.status_code == 401


def test_me_endpoint(client, auth_headers):
    headers, user_id = auth_headers
    resp = client.get("/api/v1/auth/me", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["username"].startswith("authuser_")
    assert "password_hash" not in data


def test_me_endpoint_requires_auth(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_register_validation_error(client):
    """Test validation error format for register endpoint."""
    resp = client.post(
        "/api/v1/auth/register",
        json={"username": "ab", "password": "short"},
    )
    assert resp.status_code == 422
    data = resp.get_json()
    assert data["code"] == "VALIDATION_ERROR"
    assert "body_params" in data["details"]
    body_errors = data["details"]["body_params"]
    assert len(body_errors) == 2  # username too short, password too short
    locs = [e["loc"][0] for e in body_errors]
    assert "username" in locs
    assert "password" in locs


def test_login_validation_error(client):
    """Test validation error format for login endpoint."""
    resp = client.post(
        "/api/v1/auth/login",
        json={"username": "ab"},
    )
    assert resp.status_code == 422
    data = resp.get_json()
    assert data["code"] == "VALIDATION_ERROR"
    assert "body_params" in data["details"]


def test_tasks_query_validation_error(client, auth_headers):
    """Test validation error format for query params in tasks list."""
    headers, _ = auth_headers
    resp = client.get("/api/v1/tasks?page=invalid", headers=headers)
    assert resp.status_code == 422
    data = resp.get_json()
    assert data["code"] == "VALIDATION_ERROR"
    assert "query_params" in data["details"]
    query_errors = data["details"]["query_params"]
    assert len(query_errors) >= 1
    assert query_errors[0]["loc"][0] == "page"
