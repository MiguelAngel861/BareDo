from typing import Any, Sequence

from sqlalchemy import delete, insert, select, update, func, Select, desc, asc

from app.extensions import db
from app.models.tasks import Tasks


class TasksRepository:
    def get_all(
        self, page: int, per_page: int, filters: dict | None, sort
    ) -> Sequence[Tasks] | tuple[Sequence[Tasks], int | None]:
        stmt = select(Tasks)
        filtered_stmt = self._apply_data_filters(stmt, filters)
        sorted_stmt = self._apply_sort(filtered_stmt, sort)

        if page is not None and per_page is not None:

            # data
            offset: int = (page - 1) * per_page
            data_stmt = sorted_stmt.limit(per_page).offset(offset)
            data_result: Sequence[Tasks] = db.session.execute(data_stmt).scalars().all()

        # total items
        items_stmt = select(func.count()).select_from(data_stmt.subquery())
        items_result: int | None = db.session.execute(items_stmt).scalar()

        return data_result, items_result

    @staticmethod
    def get_by_id(task_id: int) -> Tasks | None:
        stmt = select(Tasks).where(Tasks.task_id == task_id)

        with db.session as session:
            result: Tasks | None = session.execute(stmt).scalar_one_or_none()

        return result

    @staticmethod
    def add_task(data: dict[str, Any]) -> Tasks | None:
        stmt = insert(Tasks).values(**data).returning(Tasks)
        result: Tasks | None = db.session.execute(stmt).scalar_one_or_none()

        return result

    @staticmethod
    def update_task(task_id: int, data: dict[str, Any]) -> Tasks | None:
        stmt = (
            update(Tasks)
            .where(Tasks.task_id == task_id)
            .values(**data)
            .returning(Tasks)
        )
        result: Tasks | None = db.session.execute(stmt).scalar_one_or_none()

        return result

    @staticmethod
    def delete_task(task_id: int) -> bool:
        stmt = delete(Tasks).where(Tasks.task_id == task_id)
        result = db.session.execute(stmt)

        if result.rowcount == 0:  # type: ignore
            return False

        return True

    @staticmethod
    def _apply_sort(stmt: Select, sort_fields):
        columns = {
            "due_date": Tasks.due_date,
            "completed": Tasks.completed
        }
        
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

        if task_status := filters.get("completed"):
            stmt = stmt.where(Tasks.completed == task_status)

        return stmt
