from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.errors.exceptions import DatabaseError, DataValidationError, NotFoundError
from app.extensions import db
from app.models.tasks import Tasks
from app.repositories.tasks_repository import TasksRepository


class TasksService:
    def __init__(self) -> None:
        self.repository = TasksRepository()

    def get_all_tasks(self, page: int, per_page: int, filters: dict | None, sort):
        sort_fields = self._parse_sort(sort)

        tasks, total_tasks = self.repository.get_all(page, per_page, filters, sort_fields)
        
        if not tasks:
            return {}

        result: list[dict] = [task.to_dict() for task in tasks]  # type: ignore
        total_pages = (total_tasks + per_page - 1) // total_tasks if per_page else 1  # type: ignore

        return {
            "tasks": result,
            "meta": {
                "total": total_tasks,
                "page": page,
                "per_page": per_page,
                "total_pages": total_pages,
            },
        }

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

                raise DataValidationError(str(e))

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

                raise DataValidationError(str(e))

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

                raise DataValidationError(str(e))

            except SQLAlchemyError as e:
                session.rollback()

                raise DatabaseError(str(e))

    @staticmethod
    def _parse_sort(sort: str | None):
        allowed_fields = ["completed", "due_date"]

        if not sort:
            return []

        fields: list = []

        for raw in sort.split(","):
            raw = raw.strip()

            desc = raw.startswith("-")
            field = raw[1:] if desc else raw

            if field not in allowed_fields:
                continue

            fields.append((field, desc))

        return fields
