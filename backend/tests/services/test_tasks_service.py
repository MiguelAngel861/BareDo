import uuid

import pytest

from app.errors.exceptions import NotFoundError
from app.services.tasks_service import TasksService


@pytest.fixture
def tasks_service():
    return TasksService()


def unique_user():
    return {"username": f"user_{uuid.uuid4().hex[:8]}"}


def task_payload(**overrides):
    from datetime import UTC, datetime

    payload = {
        "title": "Service task",
        "description": "description",
        "priority": 1,
        "due_date": datetime.now(UTC),
        "completed": False,
    }
    payload.update(overrides)
    return payload


def test_get_all_tasks_returns_orm_and_meta(make_user, make_task, tasks_service):
    user = make_user(**unique_user())
    make_task(user.user_id, title="first")
    make_task(user.user_id, title="second")

    tasks, pagination = tasks_service.get_all_tasks(1, 10, {}, None, user.user_id)

    assert len(tasks) == 2
    assert pagination.total == 2
    assert pagination.page == 1
    assert pagination.total_pages == 1
    assert all(hasattr(t, "title") for t in tasks)


def test_get_all_tasks_only_own_user(make_user, make_task, tasks_service):
    user_a = make_user(**unique_user())
    user_b = make_user(**unique_user())
    make_task(user_a.user_id, title="mine")
    make_task(user_b.user_id, title="theirs")

    tasks, pagination = tasks_service.get_all_tasks(1, 10, None, None, user_a.user_id)

    assert pagination.total == 1
    assert tasks[0].title == "mine"


def test_get_all_tasks_pagination(make_user, make_task, tasks_service):
    user = make_user(**unique_user())
    for i in range(5):
        make_task(user.user_id, title=f"Task {i}")

    tasks, pagination = tasks_service.get_all_tasks(2, 2, None, None, user.user_id)

    assert pagination.total == 5
    assert pagination.total_pages == 3
    assert len(tasks) == 2


def test_get_all_tasks_sort_by_due_date(make_user, make_task, tasks_service):
    from datetime import date

    user = make_user(**unique_user())
    make_task(user.user_id, due_date=date(2026, 1, 1))
    make_task(user.user_id, due_date=date(2026, 12, 31))

    tasks, _ = tasks_service.get_all_tasks(1, 10, None, "-due_date", user.user_id)

    assert [t.due_date.date() for t in tasks] == [date(2026, 12, 31), date(2026, 1, 1)]


def test_get_task_by_id_returns_orm(make_user, make_task, tasks_service):
    user = make_user(**unique_user())
    task = make_task(user.user_id)

    found = tasks_service.get_task_by_id(task.task_id, user.user_id)

    assert found is not None
    assert found.task_id == task.task_id


def test_get_task_by_id_unknown_raises_not_found(make_user, tasks_service):
    user = make_user(**unique_user())

    with pytest.raises(NotFoundError):
        tasks_service.get_task_by_id(99999, user.user_id)


def test_get_task_by_id_other_user_raises_not_found(make_user, make_task, tasks_service):
    user_a = make_user(**unique_user())
    user_b = make_user(**unique_user())
    task = make_task(user_a.user_id)

    with pytest.raises(NotFoundError):
        tasks_service.get_task_by_id(task.task_id, user_b.user_id)


def test_add_new_task_returns_orm(make_user, tasks_service):
    user = make_user(**unique_user())

    task = tasks_service.add_new_task(task_payload(), user.user_id)

    assert task.task_id is not None
    assert task.user_id == user.user_id
    assert task.title == "Service task"


def test_update_task_returns_orm(make_user, make_task, tasks_service):
    user = make_user(**unique_user())
    task = make_task(user.user_id)

    updated = tasks_service.update_task(task.task_id, {"title": "Renamed"}, user.user_id)

    assert updated.task_id == task.task_id
    assert updated.title == "Renamed"


def test_update_task_unknown_raises_not_found(make_user, tasks_service):
    user = make_user(**unique_user())

    with pytest.raises(NotFoundError):
        tasks_service.update_task(99999, {"title": "x"}, user.user_id)


def test_delete_task_removes(make_user, make_task, tasks_service):
    user = make_user(**unique_user())
    task = make_task(user.user_id)

    tasks_service.delete_task(task.task_id, user.user_id)
    with pytest.raises(NotFoundError):
        tasks_service.get_task_by_id(task.task_id, user.user_id)


def test_delete_task_unknown_raises_not_found(make_user, tasks_service):
    user = make_user(**unique_user())

    with pytest.raises(NotFoundError):
        tasks_service.delete_task(99999, user.user_id)
