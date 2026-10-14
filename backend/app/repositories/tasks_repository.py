from sqlalchemy import Select, func, select

from app.models.tags import Tags
from app.models.tasks import Tasks
from app.repositories.base import BaseRepository


class TasksRepository(BaseRepository[Tasks]):
    sortable_columns = {
        "due_date": Tasks.due_date,
        "completed": Tasks.completed,
        "priority_id": Tasks.priority_id,
        "created_at": Tasks.created_at,
        "deleted_at": Tasks.deleted_at,
    }

    def __init__(self, session) -> None:
        super().__init__(session, Tasks)

    def apply_filters(self, stmt: Select, filters: dict) -> Select:
        if not filters:
            return stmt.where(Tasks.deleted_at.is_(None))

        if filters.get("in_trash") is True:
            stmt = stmt.where(Tasks.deleted_at.is_not(None))
        else:
            stmt = stmt.where(Tasks.deleted_at.is_(None))

        if title := filters.get("title"):
            stmt = stmt.where(Tasks.title.ilike(f"%{title}%"))

        if description := filters.get("description"):
            stmt = stmt.where(Tasks.description.ilike(f"%{description}%"))

        completed = filters.get("completed")
        if completed is not None:
            stmt = stmt.where(Tasks.completed == completed)

        priority_id = filters.get("priority_id")
        if priority_id is not None:
            stmt = stmt.where(Tasks.priority_id == priority_id)

        tag_ids = filters.get("tag_ids")
        if tag_ids:
            stmt = stmt.where(Tasks.tags.any(Tags.tag_id.in_(tag_ids)))

        return stmt

    def get_active_by_id(self, task_id: int, user_id: int) -> Tasks | None:
        stmt = select(Tasks).where(
            Tasks.task_id == task_id,
            Tasks.user_id == user_id,
            Tasks.deleted_at.is_(None),
        )
        return self.session.scalar(stmt)

    def get_trash_by_id(self, task_id: int, user_id: int) -> Tasks | None:
        stmt = select(Tasks).where(
            Tasks.task_id == task_id,
            Tasks.user_id == user_id,
            Tasks.deleted_at.is_not(None),
        )
        return self.session.scalar(stmt)

    def soft_delete(self, task_id: int, user_id: int) -> bool:
        task = self.get_active_by_id(task_id, user_id)
        if not task:
            return False
        task.deleted_at = func.now()
        return True

    def restore(self, task_id: int, user_id: int) -> Tasks | None:
        task = self.get_trash_by_id(task_id, user_id)
        if not task:
            return None
        task.deleted_at = None
        return task

    def hard_delete(self, task_id: int, user_id: int) -> bool:
        task = self.session.scalar(
            select(Tasks).where(Tasks.task_id == task_id, Tasks.user_id == user_id)
        )
        if not task:
            return False
        self.session.delete(task)
        return True

    def empty_trash(self, user_id: int) -> int:
        tasks = self.session.scalars(
            select(Tasks).where(Tasks.user_id == user_id, Tasks.deleted_at.is_not(None))
        ).all()
        count = len(tasks)
        for task in tasks:
            self.session.delete(task)
        return count

    def count_trash(self, user_id: int) -> int:
        stmt = select(func.count(Tasks.task_id)).where(
            Tasks.user_id == user_id, Tasks.deleted_at.is_not(None)
        )
        return self.session.scalar(stmt) or 0
