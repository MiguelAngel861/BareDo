from tests.conftest import register_user


def test_refresh_token_issue(client):
    username = "refreshuser"
    refresh_token = register_user(client, username)["refresh_token"]
    resp = client.post(
        "/api/v1/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["username"] == username


def test_refresh_token_validates_new_token(client):
    refresh_token = register_user(client, "refreshuser2")["refresh_token"]
    resp = client.post(
        "/api/v1/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )
    assert resp.status_code == 200
    new_token = resp.get_json()["access_token"]

    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {new_token}"})
    assert me_resp.status_code == 200
    data = me_resp.get_json()
    assert data["username"] == "refreshuser2"
    assert "password_hash" not in data


def test_refresh_requires_valid_token(client):
    resp = client.post("/api/v1/auth/refresh")
    assert resp.status_code == 401
