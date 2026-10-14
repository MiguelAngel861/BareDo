import uuid

import pytest

from app.errors.exceptions import DataValidationError, NotFoundError
from app.services.subtasks_service import SubtasksService


def unique_user():
    return {"username": f"user_{uuid.uuid4().hex[:8]}"}


@pytest.fixture
def subtasks_service():
    return SubtasksService()


def test_create_subtask(subtasks_service, make_user, make_task):
    user = make_user(**unique_user())
    task = make_task(user.user_id)

    subtask = subtasks_service.create_subtask(
        task_id=task.task_id,
        subtask_data={"title": "Draft specifications", "completed": False},
        user_id=user.user_id,
    )

    assert subtask.subtask_id is not None
    assert subtask.task_id == task.task_id
    assert subtask.title == "Draft specifications"
    assert subtask.completed is False


def test_create_subtask_validation_error(subtasks_service, make_user, make_task):
    user = make_user(**unique_user())
    task = make_task(user.user_id)

    with pytest.raises(DataValidationError):
        subtasks_service.create_subtask(
            task_id=task.task_id,
            subtask_data={"title": ""},
            user_id=user.user_id,
        )

    with pytest.raises(DataValidationError):
        subtasks_service.create_subtask(
            task_id=task.task_id,
            subtask_data={"title": "A" * 121},
            user_id=user.user_id,
        )


def test_create_subtask_wrong_user(subtasks_service, make_user, make_task):
    user1 = make_user(**unique_user())
    user2 = make_user(**unique_user())
    task = make_task(user1.user_id)

    with pytest.raises(NotFoundError):
        subtasks_service.create_subtask(
            task_id=task.task_id,
            subtask_data={"title": "Unauthorized"},
            user_id=user2.user_id,
        )


def test_get_task_subtasks(subtasks_service, make_user, make_task):
    user = make_user(**unique_user())
    task = make_task(user.user_id)

    subtasks_service.create_subtask(task.task_id, {"title": "Subtask 1"}, user.user_id)
    subtasks_service.create_subtask(task.task_id, {"title": "Subtask 2"}, user.user_id)

    items = subtasks_service.get_task_subtasks(task.task_id, user.user_id)
    assert len(items) == 2
    assert items[0].title == "Subtask 1"
    assert items[1].title == "Subtask 2"


def test_update_subtask(subtasks_service, make_user, make_task):
    user = make_user(**unique_user())
    task = make_task(user.user_id)
    subtask = subtasks_service.create_subtask(task.task_id, {"title": "Initial"}, user.user_id)

    updated = subtasks_service.update_subtask(
        task.task_id, subtask.subtask_id, {"title": "Renamed", "completed": True}, user.user_id
    )

    assert updated.title == "Renamed"
    assert updated.completed is True


def test_update_subtask_not_found(subtasks_service, make_user, make_task):
    user = make_user(**unique_user())
    task = make_task(user.user_id)

    with pytest.raises(NotFoundError):
        subtasks_service.update_subtask(task.task_id, 9999, {"completed": True}, user.user_id)


def test_delete_subtask(subtasks_service, make_user, make_task):
    user = make_user(**unique_user())
    task = make_task(user.user_id)
    subtask = subtasks_service.create_subtask(task.task_id, {"title": "To delete"}, user.user_id)

    subtasks_service.delete_subtask(task.task_id, subtask.subtask_id, user.user_id)

    items = subtasks_service.get_task_subtasks(task.task_id, user.user_id)
    assert len(items) == 0
