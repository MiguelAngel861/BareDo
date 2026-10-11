from collections.abc import Sequence

from app.core.pagination import Pagination
from app.errors.exceptions import DatabaseError, DataValidationError, NotFoundError
from app.models.tasks import Tasks
from app.repositories.tags_repository import TagsRepository
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
                sort_fields=parse_sort(
                    sort, allowed_fields=["completed", "due_date", "priority_id"]
                ),
                user_id=user_id,
            )
        )

    def get_task_by_id(self, task_id: int, user_id: int) -> Tasks:
        task = self._execute_in_transaction(lambda repo: repo.get_by_id(task_id, user_id=user_id))
        if not task:
            raise NotFoundError()
        return task

    @staticmethod
    def _resolve_tags(session, tag_ids: list[int], user_id: int) -> list:
        if len(tag_ids) > 7:
            raise DataValidationError("A task can have at most 7 tags")
        tags_repo = TagsRepository(session)
        tags = tags_repo.get_by_ids(tag_ids, user_id=user_id)
        if len(tags) != len(set(tag_ids)):
            raise DataValidationError("One or more tag IDs are invalid or belong to another user")
        return list(tags)

    def add_new_task(self, task_data: dict, user_id: int) -> Tasks:
        tag_ids = task_data.pop("tag_ids", None)

        def _add(repo: TasksRepository) -> Tasks:
            task = Tasks(**task_data, user_id=user_id)
            if tag_ids:
                task.tags = self._resolve_tags(repo.session, tag_ids, user_id)
            return repo.create(task)

        task = self._execute_in_transaction(_add)
        if not task:
            raise DatabaseError()
        return task

    def update_task(self, task_id: int, task_data: dict, user_id: int) -> Tasks:
        tag_ids = task_data.pop("tag_ids", None)

        def _update(repo: TasksRepository) -> Tasks:
            task = repo.get_by_id(task_id, user_id=user_id)
            if not task:
                raise NotFoundError()

            if tag_ids is not None:
                task.tags = self._resolve_tags(repo.session, tag_ids, user_id)

            for key, value in task_data.items():
                setattr(task, key, value)

            return task

        task = self._execute_in_transaction(_update)
        if not task:
            raise NotFoundError()
        return task

    def delete_task(self, task_id: int, user_id: int) -> None:
        deleted = self._execute_in_transaction(lambda repo: repo.delete(task_id, user_id=user_id))
        if not deleted:
            raise NotFoundError()
