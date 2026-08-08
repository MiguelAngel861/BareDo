from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.core.extensions import db
from app.errors.exceptions import DatabaseError, DataValidationError, NotFoundError
from app.models.tasks import Tasks
from app.repositories.tasks_repository import TasksRepository


class TasksService:
    def get_all_tasks(self, page: int, per_page: int, filters: dict | None, sort, user_id: int):
        with db.session as session:
            repository = TasksRepository(session)
            sort_fields = self._parse_sort(sort)

            tasks, total_tasks = repository.get_all(page, per_page, filters, sort_fields, user_id)

            result: list[dict] = [task.to_dict() for task in tasks]
            total_pages = (total_tasks + per_page - 1) // per_page if per_page > 0 else 0

            return {
                "tasks": result,
                "meta": {
                    "total": total_tasks,
                    "page": page,
                    "per_page": per_page,
                    "total_pages": total_pages,
                },
            }

    def get_task_by_id(self, task_id: int, user_id: int) -> dict:
        with db.session as session:
            repository = TasksRepository(session)
            stmt: Tasks | None = repository.get_by_id(task_id, user_id)
            if not stmt:
                raise NotFoundError()

            result: dict = stmt.to_dict()

            return result

    def add_new_task(self, task_data: dict, user_id: int) -> dict:
        with db.session as session:
            repository = TasksRepository(session)
            try:
                new_task: Tasks | None = repository.add_task(task_data, user_id)
                if not new_task:
                    raise DatabaseError()

                session.commit()

                return new_task.to_dict()

            except IntegrityError as e:
                session.rollback()

                raise DataValidationError(str(e)) from e

            except SQLAlchemyError as e:
                session.rollback()

                raise DatabaseError(str(e)) from e

    def update_task(self, task_id: int, task_data: dict, user_id: int) -> dict:
        with db.session as session:
            repository = TasksRepository(session)
            try:
                patched_task: Tasks | None = repository.update_task(task_id, task_data, user_id)
                if not patched_task:
                    raise NotFoundError()

                session.commit()

                return patched_task.to_dict()

            except IntegrityError as e:
                session.rollback()

                raise DataValidationError(str(e)) from e

            except SQLAlchemyError as e:
                session.rollback()

                raise DatabaseError(str(e)) from e

    def delete_task(self, task_id: int, user_id: int) -> None:
        with db.session as session:
            repository = TasksRepository(session)
            try:
                deleted_task: bool = repository.delete_task(task_id, user_id)
                if not deleted_task:
                    raise NotFoundError()

                session.commit()

            except IntegrityError as e:
                session.rollback()

                raise DataValidationError(str(e)) from e

            except SQLAlchemyError as e:
                session.rollback()

                raise DatabaseError(str(e)) from e

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
