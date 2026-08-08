import uuid

import pytest

from app.repositories.tasks_repository import TasksRepository


@pytest.fixture
def tasks_repo(db_session):
    return TasksRepository(db_session)


def unique_user():
    return {"username": f"user_{uuid.uuid4().hex[:8]}"}


def test_get_all_filters_by_user_and_title(make_user, make_task, tasks_repo):
    user_a = make_user(**unique_user())
    user_b = make_user(**unique_user())
    make_task(user_a.user_id, title="Alpha task", description="shared")
    make_task(user_a.user_id, title="Beta task", description="shared")
    make_task(user_b.user_id, title="Alpha task", description="shared")

    tasks, pagination = tasks_repo.get_all(
        page=1,
        per_page=10,
        filters={"title": "Alpha"},
        sort_fields=[],
        user_id=user_a.user_id,
    )

    assert pagination.total == 1
    assert [t.title for t in tasks] == ["Alpha task"]


def test_get_all_filters_completed(make_user, make_task, tasks_repo):
    user = make_user(**unique_user())
    make_task(user.user_id, title="done", completed=True)
    make_task(user.user_id, title="pending", completed=False)

    tasks, pagination = tasks_repo.get_all(
        page=1,
        per_page=10,
        filters={"completed": True},
        sort_fields=[],
        user_id=user.user_id,
    )

    assert pagination.total == 1
    assert tasks[0].title == "done"


def test_get_all_sort_by_due_date_desc(make_user, make_task, tasks_repo):
    from datetime import date

    user = make_user(**unique_user())
    make_task(user.user_id, due_date=date(2026, 1, 1))
    make_task(user.user_id, due_date=date(2026, 12, 31))

    tasks, pagination = tasks_repo.get_all(
        page=1,
        per_page=10,
        filters=None,
        sort_fields=[("due_date", True)],
        user_id=user.user_id,
    )

    assert pagination.total == 2
    assert [t.due_date.isoformat()[:10] for t in tasks] == ["2026-12-31", "2026-01-01"]


def test_get_all_pagination(make_user, make_task, tasks_repo):
    user = make_user(**unique_user())
    for i in range(5):
        make_task(user.user_id, title=f"Task {i}")

    tasks, pagination = tasks_repo.get_all(
        page=2,
        per_page=2,
        filters=None,
        sort_fields=[],
        user_id=user.user_id,
    )

    assert pagination.total == 5
    assert len(tasks) == 2


def test_get_by_id_scoped_to_user(make_user, make_task, tasks_repo):
    user_a = make_user(**unique_user())
    user_b = make_user(**unique_user())
    task = make_task(user_a.user_id, title="private")

    assert tasks_repo.get_by_id(task.task_id, user_a.user_id).title == "private"
    assert tasks_repo.get_by_id(task.task_id, user_b.user_id) is None


def test_add_task_assigns_user(make_user, tasks_repo):
    from datetime import date

    user = make_user(**unique_user())

    task = tasks_repo.add_task(
        {
            "title": "Task title",
            "description": "Task description",
            "priority": 1,
            "due_date": date(2026, 8, 10),
            "completed": False,
        },
        user.user_id,
    )

    assert task is not None
    assert task.user_id == user.user_id
    assert task.title == "Task title"


def test_update_task_returns_updated(make_user, make_task, tasks_repo):
    user = make_user(**unique_user())
    task = make_task(user.user_id)

    updated = tasks_repo.update_task(task.task_id, {"title": "Renamed"}, user.user_id)

    assert updated is not None
    assert updated.title == "Renamed"


def test_update_task_unknown_returns_none(make_user, tasks_repo):
    user = make_user(**unique_user())

    assert tasks_repo.update_task(99999, {"title": "x"}, user.user_id) is None


def test_delete_task_only_owner(make_user, make_task, tasks_repo):
    user_a = make_user(**unique_user())
    user_b = make_user(**unique_user())
    task = make_task(user_a.user_id)

    assert tasks_repo.delete_task(task.task_id, user_b.user_id) is False
    assert tasks_repo.delete_task(task.task_id, user_a.user_id) is True
