from app.models.tasks import Tasks
from app.repositories.base import BaseRepository


class TasksRepository(BaseRepository[Tasks]):
    sortable_columns = {"due_date": Tasks.due_date, "completed": Tasks.completed}

    def __init__(self, session) -> None:
        super().__init__(session, Tasks)

    def apply_filters(self, stmt, filters: dict):
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
