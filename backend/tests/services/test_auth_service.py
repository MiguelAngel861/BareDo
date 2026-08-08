import uuid

import pytest

from app.errors.exceptions import DataValidationError
from app.services.auth_service import AuthService


@pytest.fixture
def auth_service():
    return AuthService()


def test_register_returns_orm_user(auth_service):
    user = auth_service.register(f"svc_{uuid.uuid4().hex[:8]}", "password123")

    assert user.user_id is not None
    assert user.username.startswith("svc_")


def test_register_duplicate_raises_validation_error(auth_service):
    username = f"dup_{uuid.uuid4().hex[:8]}"
    auth_service.register(username, "password123")

    with pytest.raises(DataValidationError):
        auth_service.register(username, "password123")


def test_login_success(auth_service):
    username = f"login_{uuid.uuid4().hex[:8]}"
    auth_service.register(username, "password123")

    user = auth_service.login(username, "password123")

    assert user is not None
    assert user.username == username


def test_login_wrong_password_returns_none(auth_service):
    username = f"wrong_{uuid.uuid4().hex[:8]}"
    auth_service.register(username, "password123")

    assert auth_service.login(username, "wrongpass") is None


def test_login_unknown_user_returns_none(auth_service):
    assert auth_service.login(f"ghost_{uuid.uuid4().hex[:8]}", "password123") is None


def test_get_user_by_id_returns_user(auth_service):
    user = auth_service.register(f"byid_{uuid.uuid4().hex[:8]}", "password123")

    found = auth_service.get_user_by_id(user.user_id)

    assert found is not None
    assert found.user_id == user.user_id


def test_get_user_by_id_unknown_returns_none(auth_service):
    assert auth_service.get_user_by_id(99999) is None
