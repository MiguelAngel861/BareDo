from collections.abc import Sequence

from app.core.db import transactional
from app.core.pagination import Pagination
from app.errors.exceptions import DatabaseError, NotFoundError
from app.models.tasks import Tasks
from app.repositories.tasks_repository import TasksRepository
from app.utils.sorting import parse_sort


class TasksService:
    def get_all_tasks(
        self, page: int, per_page: int, filters: dict | None, sort: str | None, user_id: int
    ) -> tuple[Sequence[Tasks], Pagination]:
        with transactional() as session:
            repository = TasksRepository(session)
            sort_fields = parse_sort(sort, allowed_fields=["completed", "due_date"])
            return repository.get_all(page, per_page, filters, sort_fields, user_id)

    def get_task_by_id(self, task_id: int, user_id: int) -> Tasks:
        with transactional() as session:
            task = TasksRepository(session).get_by_id(task_id, user_id)
            if not task:
                raise NotFoundError()
            return task

    def add_new_task(self, task_data: dict, user_id: int) -> Tasks:
        with transactional() as session:
            task = TasksRepository(session).add_task(task_data, user_id)
            if not task:
                raise DatabaseError()
            return task

    def update_task(self, task_id: int, task_data: dict, user_id: int) -> Tasks:
        with transactional() as session:
            task = TasksRepository(session).update_task(task_id, task_data, user_id)
            if not task:
                raise NotFoundError()
            return task

    def delete_task(self, task_id: int, user_id: int) -> None:
        with transactional() as session:
            deleted = TasksRepository(session).delete_task(task_id, user_id)
            if not deleted:
                raise NotFoundError()
