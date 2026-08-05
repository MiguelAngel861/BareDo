from typing import Any, Sequence

from sqlalchemy import delete, insert, select, update, func, Select, desc, asc

from app.extensions import db
from app.models.tasks import Tasks


class TasksRepository:
    def get_all(
        self, page: int, per_page: int, filters: dict | None, sort, user_id: int
    ) -> tuple[Sequence[Tasks], int]:
        # Base filtered query
        base_stmt = self._apply_sort(
            self._apply_data_filters(select(Tasks).where(Tasks.user_id == user_id), filters), sort
        )

        # Count total items before pagination
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_count: int = db.session.execute(count_stmt).scalar()

        # Paginated data query
        offset: int = (page - 1) * per_page
        data_stmt = base_stmt.offset(offset).limit(per_page)
        data_result: Sequence[Tasks] = db.session.execute(data_stmt).scalars().all()

        return data_result, total_count

    def get_by_id(self, task_id: int, user_id: int) -> Tasks | None:
        stmt = select(Tasks).where(Tasks.task_id == task_id, Tasks.user_id == user_id)

        with db.session as session:
            result: Tasks | None = session.execute(stmt).scalar_one_or_none()

        return result

    def add_task(self, data: dict[str, Any], user_id: int) -> Tasks | None:
        data["user_id"] = user_id
        stmt = insert(Tasks).values(**data).returning(Tasks)
        result: Tasks | None = db.session.execute(stmt).scalar_one_or_none()

        return result

    def update_task(self, task_id: int, data: dict[str, Any], user_id: int) -> Tasks | None:
        stmt = (
            update(Tasks)
            .where(Tasks.task_id == task_id, Tasks.user_id == user_id)
            .values(**data)
            .returning(Tasks)
        )
        result: Tasks | None = db.session.execute(stmt).scalar_one_or_none()

        return result

    def delete_task(self, task_id: int, user_id: int) -> bool:
        stmt = delete(Tasks).where(Tasks.task_id == task_id, Tasks.user_id == user_id)
        result = db.session.execute(stmt)

        if result.rowcount == 0:  # type: ignore
            return False

        return True

    @staticmethod
    def _apply_sort(stmt: Select, sort_fields):
        columns = {"due_date": Tasks.due_date, "completed": Tasks.completed}

        for field, is_desc in sort_fields:
            column = columns[field]
            stmt = stmt.order_by(desc(column) if is_desc else asc(column))

        return stmt

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
