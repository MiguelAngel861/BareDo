from collections.abc import Sequence

from sqlalchemy import select

from app.models.subtasks import Subtasks
from app.repositories.base import BaseRepository


class SubtasksRepository(BaseRepository[Subtasks]):
    def __init__(self, session) -> None:
        super().__init__(session, Subtasks)

    def get_by_id_and_task(self, subtask_id: int, task_id: int) -> Subtasks | None:
        stmt = select(Subtasks).where(
            Subtasks.subtask_id == subtask_id, Subtasks.task_id == task_id
        )
        return self.session.scalar(stmt)

    def get_by_task_id(self, task_id: int) -> Sequence[Subtasks]:
        stmt = (
            select(Subtasks).where(Subtasks.task_id == task_id).order_by(Subtasks.subtask_id.asc())
        )
        return self.session.scalars(stmt).all()
