from typing import Sequence

from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.extensions import db
from app.models.tasks import Tasks
from app.repositories.tasks_repository import TasksRepository
from app.utils.exceptions import DatabaseError, NotFoundError, ValidationError


class TasksService:
    def __init__(self) -> None:
        self.repository = TasksRepository()

    def get_all_tasks(self) -> list[dict]:
        stmt: Sequence[Tasks] = self.repository.get_all()
        if not stmt:
            return []

        result: list[dict] = [task.to_dict() for task in stmt]

        return result

    def get_task_by_id(self, task_id: int) -> dict:
        stmt: Tasks | None = self.repository.get_by_id(task_id)
        if not stmt:
            raise NotFoundError()

        result: dict = stmt.to_dict()

        return result

    def add_new_task(self, task_data: dict) -> dict:
        with db.session as session:
            try:
                new_task: Tasks | None = self.repository.add_task(task_data)
                if not new_task:
                    raise DatabaseError()

                session.commit()

                return new_task.to_dict()

            except IntegrityError as e:
                session.rollback()

                raise ValidationError(str(e))

            except SQLAlchemyError as e:
                session.rollback()

                raise DatabaseError(str(e))

    def update_task(self, task_id: int, task_data: dict) -> dict:
        with db.session as session:
            try:
                patched_task: Tasks | None = self.repository.update_task(
                    task_id, task_data
                )
                if not patched_task:
                    raise NotFoundError()

                session.commit()

                return patched_task.to_dict()

            except IntegrityError as e:
                session.rollback()

                raise ValidationError(str(e))

            except SQLAlchemyError as e:
                session.rollback()

                raise DatabaseError(str(e))

    def delete_task(self, task_id: int) -> None:
        with db.session as session:
            try:
                deleted_task: bool = self.repository.delete_task(task_id)
                if not deleted_task:
                    raise NotFoundError()

                session.commit()

            except IntegrityError as e:
                session.rollback()

                raise ValidationError(str(e))

            except SQLAlchemyError as e:
                session.rollback()

                raise DatabaseError(str(e))
