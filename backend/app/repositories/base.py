from collections.abc import Sequence
from typing import Any

from sqlalchemy import Select, asc, desc, func, inspect, select, update
from sqlalchemy.orm import Session

from app.core.pagination import Pagination


class BaseRepository[T]:
    sortable_columns: dict[str, Any] = {}

    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model
        self._pk_column = self._get_primary_key_column()

    def _get_primary_key_column(self) -> Any:
        mapper = inspect(self.model)
        pk_columns = mapper.primary_key
        if len(pk_columns) == 1:
            return pk_columns[0]
        raise ValueError(f"Model {self.model.__name__} must have exactly one primary key column")

    def get_by_id(self, entity_id: int, **extra_filters: Any) -> T | None:
        if not extra_filters:
            return self.session.get(self.model, entity_id)

        stmt = select(self.model).where(self._pk_column == entity_id).filter_by(**extra_filters)
        return self.session.scalar(stmt)

    def get_all(
        self,
        page: int,
        per_page: int,
        filters: dict[str, Any] | None,
        sort_fields: list[tuple[str, bool]],
        **extra_filters: Any,
    ) -> tuple[Sequence[T], Pagination]:
        stmt = select(self.model).filter_by(**extra_filters)
        stmt = self.apply_filters(stmt, filters or {})
        stmt = self._apply_sort(stmt, sort_fields, self.sortable_columns)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.session.scalar(count_stmt) or 0

        offset: int = (page - 1) * per_page
        data_stmt = stmt.offset(offset).limit(per_page)
        data_result: Sequence[T] = self.session.scalars(data_stmt).all()

        return data_result, Pagination(page=page, per_page=per_page, total=total)

    def apply_filters(self, stmt: Select, filters: dict[str, Any]) -> Select:
        return stmt

    def create(self, entity: T) -> T:
        self.session.add(entity)
        return entity

    def update(self, entity_id: int, data: dict[str, Any], **extra_filters: Any) -> T | None:
        stmt = (
            update(self.model)
            .where(self._pk_column == entity_id)
            .filter_by(**extra_filters)
            .values(**data)
            .returning(self.model)
        )
        return self.session.scalar(stmt)

    def delete(self, entity_id: int, **extra_filters: Any) -> bool:
        entity = self.get_by_id(entity_id, **extra_filters)
        if not entity:
            return False
        self.session.delete(entity)
        return True

    @staticmethod
    def _apply_sort(
        stmt: Select, sort_fields: list[tuple[str, bool]], columns: dict[str, Any]
    ) -> Select:
        for field, is_desc in sort_fields:
            column = columns[field]
            stmt = stmt.order_by(desc(column) if is_desc else asc(column))

        return stmt
