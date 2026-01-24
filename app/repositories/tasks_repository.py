from typing import Any, Sequence

from sqlalchemy import delete, insert, select, update

from app.extensions import db
from app.models.tasks import Tasks


class TasksRepository:
    @staticmethod
    def get_all() -> Sequence[Tasks]:
        stmt = select(Tasks)

        with db.session as session:
            result: Sequence[Tasks] = session.execute(stmt).scalars().all()

        return result

    @staticmethod
    def get_by_id(task_id: int) -> Tasks | None:
        stmt = select(Tasks).where(Tasks.task_id == task_id)

        with db.session as session:
            result: Tasks | None = session.execute(stmt).scalar_one_or_none()

        return result

    @staticmethod
    def add_task(data: dict[str, Any]) -> Tasks | None:
        stmt = insert(Tasks).values(**data).returning(Tasks)

        with db.session as session:
            result: Tasks | None = session.execute(stmt).scalar_one_or_none()

        return result

    @staticmethod
    def update_task(task_id: int, data: dict[str, Any]) -> Tasks | None:
        stmt = (
            update(Tasks)
            .where(Tasks.task_id == task_id)
            .values(**data)
            .returning(Tasks)
        )

        with db.session as session:
            result: Tasks | None = session.execute(stmt).scalar_one_or_none()

        return result

    @staticmethod
    def delete_task(task_id: int) -> bool:
        stmt = delete(Tasks).where(Tasks.task_id == task_id)

        with db.session as session:
            result = session.execute(stmt)

        if result.rowcount == 0:  # type: ignore
            return False

        return True
