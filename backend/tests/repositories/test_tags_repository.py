import uuid

import pytest

from app.models.tags import Tags
from app.repositories.tags_repository import TagsRepository


def unique_user():
    return {"username": f"user_{uuid.uuid4().hex[:8]}"}


@pytest.fixture
def tags_repo(db_session):
    return TagsRepository(db_session)


def test_create_and_get_by_id(tags_repo, make_user):
    user = make_user(**unique_user())
    tag = tags_repo.create(Tags(name="backend", user_id=user.user_id))
    tags_repo.session.flush()

    assert tag.tag_id is not None
    fetched = tags_repo.get_by_id(tag.tag_id, user_id=user.user_id)
    assert fetched is not None
    assert fetched.name == "backend"


def test_get_by_name(tags_repo, make_user):
    user = make_user(**unique_user())
    tags_repo.create(Tags(name="frontend", user_id=user.user_id))
    tags_repo.session.flush()

    fetched = tags_repo.get_by_name("frontend", user_id=user.user_id)
    assert fetched is not None
    assert fetched.name == "frontend"

    not_found = tags_repo.get_by_name("nonexistent", user_id=user.user_id)
    assert not_found is None


def test_get_all_by_user(tags_repo, make_user):
    user1 = make_user(**unique_user())
    user2 = make_user(**unique_user())

    tags_repo.create(Tags(name="tag-b", user_id=user1.user_id))
    tags_repo.create(Tags(name="tag-a", user_id=user1.user_id))
    tags_repo.create(Tags(name="tag-other", user_id=user2.user_id))
    tags_repo.session.flush()

    user1_tags = tags_repo.get_all_by_user(user1.user_id)
    assert len(user1_tags) == 2
    assert [t.name for t in user1_tags] == ["tag-a", "tag-b"]


def test_get_by_ids(tags_repo, make_user):
    user = make_user(**unique_user())
    t1 = tags_repo.create(Tags(name="t1", user_id=user.user_id))
    t2 = tags_repo.create(Tags(name="t2", user_id=user.user_id))
    tags_repo.session.flush()

    found = tags_repo.get_by_ids([t1.tag_id, t2.tag_id], user_id=user.user_id)
    assert len(found) == 2

    # Should not find if from another user
    other_user = make_user(**unique_user())
    assert tags_repo.get_by_ids([t1.tag_id], user_id=other_user.user_id) == []
