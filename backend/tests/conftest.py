import pytest
from app import create_app
from app.extensions import db as _db
from app.extensions import Base
from app.models.users import Users
from app.models.tasks import Tasks


@pytest.fixture(scope="session")
def app():
    _app = create_app("testing")
    with _app.app_context():
        Base.metadata.create_all(_db.get_engine())
        yield _app
        Base.metadata.drop_all(_db.get_engine())


@pytest.fixture(scope="function")
def client(app):
    return app.test_client()


@pytest.fixture(scope="function")
def db_session(app):
    with app.app_context():
        _db.session.begin_nested()
        yield _db.session
        _db.session.rollback()


@pytest.fixture
def make_user(db_session):
    def _make_user(**overrides):
        defaults = {
            "username": "testuser",
            "password": "testpass123",
        }
        defaults.update(overrides)
        password = defaults.pop("password")
        user = Users(**defaults)
        user.set_password(password)
        db_session.add(user)
        db_session.commit()
        return user

    return _make_user


@pytest.fixture
def make_task(db_session):
    def _make_task(user_id, **overrides):
        from datetime import date

        defaults = {
            "user_id": user_id,
            "title": "Test Task",
            "description": "Test Description",
            "priority": 1,
            "due_date": date.today(),
            "completed": False,
        }
        defaults.update(overrides)
        task = Tasks(**defaults)
        db_session.add(task)
        db_session.commit()
        return task

    return _make_task


@pytest.fixture
def auth_headers(client, make_user):
    import uuid

    username = f"authuser_{uuid.uuid4().hex[:8]}"
    user = make_user(username=username, password="authpass123")
    resp = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": "authpass123"},
    )
    assert resp.status_code == 200
    access_token = resp.get_json()["access_token"]
    return {"Authorization": f"Bearer {access_token}"}, user.user_id
