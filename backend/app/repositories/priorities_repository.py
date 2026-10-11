from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.priorities import Priorities
from app.repositories.base import BaseRepository


class PrioritiesRepository(BaseRepository[Priorities]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Priorities)

    def get_all(self) -> list[Priorities]:
        stmt = select(Priorities).order_by(Priorities.level)
        return list(self.session.scalars(stmt).all())

    def get_by_level(self, level: int) -> Priorities | None:
        stmt = select(Priorities).where(Priorities.level == level)
        return self.session.scalar(stmt)
