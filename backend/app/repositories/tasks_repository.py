from collections.abc import Sequence
from typing import Any

from sqlalchemy import Select, delete, func, insert, select, update
from sqlalchemy.orm import Session

from app.core.repositories.base import BaseRepository
from app.models.tasks import Tasks


class TasksRepository(BaseRepository[Tasks]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Tasks)

    def get_all(
        self,
        page: int,
        per_page: int,
        filters: dict | None,
        sort_fields: list[tuple[str, bool]],
        user_id: int,
    ) -> tuple[Sequence[Tasks], int]:
        base_stmt = self._apply_sort(
            self._apply_data_filters(select(Tasks).where(Tasks.user_id == user_id), filters),
            sort_fields,
            {"due_date": Tasks.due_date, "completed": Tasks.completed},
        )

        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_count: int = self.session.execute(count_stmt).scalar()

        offset: int = (page - 1) * per_page
        data_stmt = base_stmt.offset(offset).limit(per_page)
        data_result: Sequence[Tasks] = self.session.execute(data_stmt).scalars().all()

        return data_result, total_count

    def get_by_id(self, task_id: int, user_id: int) -> Tasks | None:
        stmt = select(Tasks).where(Tasks.task_id == task_id, Tasks.user_id == user_id)

        return self.session.scalar(stmt)

    def add_task(self, data: dict[str, Any], user_id: int) -> Tasks | None:
        data["user_id"] = user_id
        stmt = insert(Tasks).values(**data).returning(Tasks)

        return self.session.execute(stmt).scalar_one_or_none()

    def update_task(self, task_id: int, data: dict[str, Any], user_id: int) -> Tasks | None:
        stmt = (
            update(Tasks)
            .where(Tasks.task_id == task_id, Tasks.user_id == user_id)
            .values(**data)
            .returning(Tasks)
        )

        return self.session.execute(stmt).scalar_one_or_none()

    def delete_task(self, task_id: int, user_id: int) -> bool:
        stmt = delete(Tasks).where(Tasks.task_id == task_id, Tasks.user_id == user_id)
        result = self.session.execute(stmt)

        return result.rowcount > 0  # type: ignore

    @staticmethod
    def _apply_data_filters(stmt: Select, filters: dict | None):
        if not filters:
            return stmt

        if title := filters.get("title"):
            stmt = stmt.where(Tasks.title.ilike(f"%{title}%"))

        if description := filters.get("description"):
            stmt = stmt.where(Tasks.description.ilike(f"%{description}%"))

        completed = filters.get("completed")
        if completed is not None:
            stmt = stmt.where(Tasks.completed == completed)

        return stmt
