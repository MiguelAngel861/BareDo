import uuid

import pytest

from app.repositories.users_repository import UsersRepository


@pytest.fixture
def users_repo(db_session):
    return UsersRepository(db_session)


def test_get_by_username_found(make_user, users_repo):
    username = f"unique_{uuid.uuid4().hex[:8]}"
    user = make_user(username=username)

    assert users_repo.get_by_username(username) is user


def test_get_by_username_unknown_returns_none(users_repo):
    assert users_repo.get_by_username("nobody") is None
