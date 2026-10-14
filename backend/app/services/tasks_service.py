from collections.abc import Sequence

from app.core.pagination import Pagination
from app.errors.exceptions import DatabaseError, DataValidationError, NotFoundError
from app.models.subtasks import Subtasks
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
        task = self._execute_in_transaction(
            lambda repo: repo.get_active_by_id(task_id, user_id=user_id)
        )
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
        subtasks_data = task_data.pop("subtasks", None)

        def _add(repo: TasksRepository) -> Tasks:
            task = Tasks(**task_data, user_id=user_id)
            if tag_ids:
                task.tags = self._resolve_tags(repo.session, tag_ids, user_id)
            if subtasks_data:
                task.subtasks = [
                    Subtasks(
                        title=s["title"].strip(),
                        completed=s.get("completed", False),
                    )
                    for s in subtasks_data
                    if s.get("title", "").strip()
                ]
            return repo.create(task)

        task = self._execute_in_transaction(_add)
        if not task:
            raise DatabaseError()
        return task

    def update_task(self, task_id: int, task_data: dict, user_id: int) -> Tasks:
        tag_ids = task_data.pop("tag_ids", None)

        def _update(repo: TasksRepository) -> Tasks:
            task = repo.get_active_by_id(task_id, user_id=user_id)
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
        deleted = self._execute_in_transaction(
            lambda repo: repo.soft_delete(task_id, user_id=user_id)
        )
        if not deleted:
            raise NotFoundError()

    def get_trash_tasks(
        self, page: int, per_page: int, sort: str | None, user_id: int
    ) -> tuple[Sequence[Tasks], Pagination]:
        return self._execute_in_transaction(
            lambda repo: repo.get_all(
                page=page,
                per_page=per_page,
                filters={"in_trash": True},
                sort_fields=parse_sort(
                    sort,
                    allowed_fields=[
                        "completed",
                        "due_date",
                        "priority_id",
                        "created_at",
                        "deleted_at",
                    ],
                )
                if sort
                else [("deleted_at", True)],
                user_id=user_id,
            )
        )

    def count_trash_tasks(self, user_id: int) -> int:
        return self._execute_in_transaction(lambda repo: repo.count_trash(user_id=user_id))

    def restore_task(self, task_id: int, user_id: int) -> Tasks:
        restored = self._execute_in_transaction(lambda repo: repo.restore(task_id, user_id=user_id))
        if not restored:
            raise NotFoundError()
        return restored

    def permanent_delete_task(self, task_id: int, user_id: int) -> None:
        deleted = self._execute_in_transaction(
            lambda repo: repo.hard_delete(task_id, user_id=user_id)
        )
        if not deleted:
            raise NotFoundError()

    def empty_trash(self, user_id: int) -> int:
        return self._execute_in_transaction(lambda repo: repo.empty_trash(user_id=user_id))
