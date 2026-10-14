from collections.abc import Sequence

from app.errors.exceptions import DataValidationError, NotFoundError
from app.models.subtasks import Subtasks
from app.repositories.subtasks_repository import SubtasksRepository
from app.repositories.tasks_repository import TasksRepository
from app.services.base import BaseService


class SubtasksService(BaseService):
    @property
    def repository_class(self) -> type[SubtasksRepository]:
        return SubtasksRepository

    def _verify_task_ownership(self, session, task_id: int, user_id: int):
        tasks_repo = TasksRepository(session)
        task = tasks_repo.get_active_by_id(task_id, user_id=user_id)
        if not task:
            raise NotFoundError("Task not found")
        return task

    def get_task_subtasks(self, task_id: int, user_id: int) -> Sequence[Subtasks]:
        def _get(repo: SubtasksRepository) -> Sequence[Subtasks]:
            self._verify_task_ownership(repo.session, task_id, user_id)
            return repo.get_by_task_id(task_id)

        return self._execute_in_transaction(_get)

    def create_subtask(self, task_id: int, subtask_data: dict, user_id: int) -> Subtasks:
        title = subtask_data.get("title", "").strip()
        if not title:
            raise DataValidationError("Title cannot be empty")
        if len(title) > 120:
            raise DataValidationError("Title cannot exceed 120 characters")

        def _create(repo: SubtasksRepository) -> Subtasks:
            self._verify_task_ownership(repo.session, task_id, user_id)
            subtask = Subtasks(
                task_id=task_id,
                title=title,
                completed=subtask_data.get("completed", False),
            )
            return repo.create(subtask)

        return self._execute_in_transaction(_create)

    def update_subtask(
        self, task_id: int, subtask_id: int, update_data: dict, user_id: int
    ) -> Subtasks:
        def _update(repo: SubtasksRepository) -> Subtasks:
            self._verify_task_ownership(repo.session, task_id, user_id)
            subtask = repo.get_by_id_and_task(subtask_id, task_id)
            if not subtask:
                raise NotFoundError("Subtask not found")

            if "title" in update_data and update_data["title"] is not None:
                title = update_data["title"].strip()
                if not title:
                    raise DataValidationError("Title cannot be empty")
                if len(title) > 120:
                    raise DataValidationError("Title cannot exceed 120 characters")
                subtask.title = title

            if "completed" in update_data and update_data["completed"] is not None:
                subtask.completed = bool(update_data["completed"])

            return subtask

        return self._execute_in_transaction(_update)

    def delete_subtask(self, task_id: int, subtask_id: int, user_id: int) -> None:
        def _delete(repo: SubtasksRepository) -> None:
            self._verify_task_ownership(repo.session, task_id, user_id)
            subtask = repo.get_by_id_and_task(subtask_id, task_id)
            if not subtask:
                raise NotFoundError("Subtask not found")
            repo.session.delete(subtask)

        return self._execute_in_transaction(_delete)
