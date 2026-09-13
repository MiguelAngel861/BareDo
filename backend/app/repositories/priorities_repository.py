from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.priorities import Priorities


class PrioritiesRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_all(self) -> list[Priorities]:
        stmt = select(Priorities).order_by(Priorities.level)
        return list(self.session.execute(stmt).scalars().all())

    def get_by_id(self, priority_id: int) -> Priorities | None:
        return self.session.get(Priorities, priority_id)

    def get_by_level(self, level: int) -> Priorities | None:
        stmt = select(Priorities).where(Priorities.level == level)
        return self.session.scalar(stmt)
