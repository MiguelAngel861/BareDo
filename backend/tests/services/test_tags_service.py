import uuid

import pytest

from app.errors.exceptions import ConflictError, DataValidationError, NotFoundError
from app.services.tags_service import TagsService


def unique_user():
    return {"username": f"user_{uuid.uuid4().hex[:8]}"}


@pytest.fixture
def tags_service():
    return TagsService()


def test_create_tag_normalizes_name(tags_service, make_user):
    user = make_user(**unique_user())
    tag = tags_service.create_tag("   BugFix   ", user.user_id)

    assert tag.name == "bugfix"
    assert tag.user_id == user.user_id


def test_create_tag_duplicate_raises_conflict(tags_service, make_user):
    user = make_user(**unique_user())
    tags_service.create_tag("urgent", user.user_id)

    with pytest.raises(ConflictError):
        tags_service.create_tag("URGENT", user.user_id)


def test_create_tag_empty_raises_validation_error(tags_service, make_user):
    user = make_user(**unique_user())
    with pytest.raises(DataValidationError):
        tags_service.create_tag("   ", user.user_id)


def test_create_tag_too_long_raises_validation_error(tags_service, make_user):
    user = make_user(**unique_user())
    with pytest.raises(DataValidationError):
        tags_service.create_tag("a" * 31, user.user_id)


def test_get_all_user_tags(tags_service, make_user):
    user = make_user(**unique_user())
    tags_service.create_tag("tag-2", user.user_id)
    tags_service.create_tag("tag-1", user.user_id)

    tags = tags_service.get_all_user_tags(user.user_id)
    assert len(tags) == 2
    assert [t.name for t in tags] == ["tag-1", "tag-2"]


def test_delete_tag(tags_service, make_user):
    user = make_user(**unique_user())
    tag = tags_service.create_tag("to-delete", user.user_id)

    tags_service.delete_tag(tag.tag_id, user.user_id)

    assert len(tags_service.get_all_user_tags(user.user_id)) == 0


def test_delete_tag_not_found(tags_service, make_user):
    user = make_user(**unique_user())
    with pytest.raises(NotFoundError):
        tags_service.delete_tag(999, user.user_id)


def test_validate_and_get_tags(tags_service, make_user):
    user = make_user(**unique_user())
    t1 = tags_service.create_tag("t1", user.user_id)
    t2 = tags_service.create_tag("t2", user.user_id)

    tags = tags_service.validate_and_get_tags([t1.tag_id, t2.tag_id], user.user_id)
    assert len(tags) == 2

    # More than 7 tags raises DataValidationError
    with pytest.raises(DataValidationError):
        tags_service.validate_and_get_tags(list(range(1, 9)), user.user_id)

    # Invalid ID raises DataValidationError
    with pytest.raises(DataValidationError):
        tags_service.validate_and_get_tags([t1.tag_id, 9999], user.user_id)
