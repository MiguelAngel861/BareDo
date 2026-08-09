from typing import Any

from sqlalchemy import Select, asc, desc
from sqlalchemy.orm import Session


class BaseRepository[T]:
    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> T | None:
        return self.session.get(self.model, entity_id)

    def add(self, entity: T) -> T:
        self.session.add(entity)
        return entity

    @staticmethod
    def _apply_sort(
        stmt: Select, sort_fields: list[tuple[str, bool]], columns: dict[str, Any]
    ) -> Select:
        for field, is_desc in sort_fields:
            column = columns[field]
            stmt = stmt.order_by(desc(column) if is_desc else asc(column))

        return stmt
