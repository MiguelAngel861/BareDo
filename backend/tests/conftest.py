import pytest

from app import create_app
from app.extensions import db as _db
from app.models.tasks import Base


@pytest.fixture()
def app():
    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_ENGINES"] = {"default": "sqlite:///:memory:"}

    with app.app_context():
        Base.metadata.create_all(_db.engine)
        yield app
        Base.metadata.drop_all(_db.engine)


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def seed_tasks(client):
    """Create 15 tasks for pagination tests."""
    for i in range(15):
        client.post(
            "/api/v1/tasks",
            json={
                "title": f"Task {i:02d}",
                "description": f"Description {i:02d}",
                "priority": (i % 3) + 1,
                "completed": i % 2 == 0,
            },
        )
