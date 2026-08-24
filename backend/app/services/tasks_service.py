from collections.abc import Sequence

from app.core.pagination import Pagination
from app.errors.exceptions import DatabaseError, NotFoundError
from app.models.tasks import Tasks
from app.repositories.tasks_repository import TasksRepository
from app.services.base import BaseService
from app.utils.sorting import parse_sort


class TasksService(BaseService):
    @property
    def repository_class(self) -> type[TasksRepository]:
        return TasksRepository

    def get_all_tasks(
        self, page: int, per_page: int, filters: dict | None, sort: str | None, user_id: int
    ) -> tuple[Sequence[Tasks], Pagination]:
        return self._execute_in_transaction(
            lambda repo: repo.get_all(
                page=page,
                per_page=per_page,
                filters=filters,
                sort_fields=parse_sort(sort, allowed_fields=["completed", "due_date"]),
                user_id=user_id,
            )
        )

    def get_task_by_id(self, task_id: int, user_id: int) -> Tasks:
        task = self._execute_in_transaction(lambda repo: repo.get_by_id(task_id, user_id=user_id))
        if not task:
            raise NotFoundError()
        return task

    def add_new_task(self, task_data: dict, user_id: int) -> Tasks:
        task = self._execute_in_transaction(
            lambda repo: repo.create(Tasks(**task_data, user_id=user_id))
        )
        if not task:
            raise DatabaseError()
        return task

    def update_task(self, task_id: int, task_data: dict, user_id: int) -> Tasks:
        task = self._execute_in_transaction(
            lambda repo: repo.update(task_id, task_data, user_id=user_id)
        )
        if not task:
            raise NotFoundError()
        return task

    def delete_task(self, task_id: int, user_id: int) -> None:
        deleted = self._execute_in_transaction(lambda repo: repo.delete(task_id, user_id=user_id))
        if not deleted:
            raise NotFoundError()
