def test_register_user(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={"username": "newuser", "password": "password123"},
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
        json={"username": "dupuser", "password": "password123"},
    )
    resp = client.post(
        "/api/v1/auth/register",
        json={"username": "dupuser", "password": "password123"},
    )
    # Current behavior: catch-all Exception returns 400 (bug D8 in plan)
    # Will be fixed to 409 in later phases
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["error"]["code"] == "BAD_REQUEST"


def test_login_success(client):
    client.post(
        "/api/v1/auth/register",
        json={"username": "loginuser", "password": "password123"},
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"username": "loginuser", "password": "password123"},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["username"] == "loginuser"


def test_login_wrong_password(client):
    client.post(
        "/api/v1/auth/register",
        json={"username": "loginuser2", "password": "password123"},
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"username": "loginuser2", "password": "wrongpass"},
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
