from collections.abc import Sequence

from sqlalchemy import select

from app.models.tags import Tags
from app.repositories.base import BaseRepository


class TagsRepository(BaseRepository[Tags]):
    def __init__(self, session) -> None:
        super().__init__(session, Tags)

    def get_by_name(self, name: str, user_id: int) -> Tags | None:
        stmt = select(Tags).where(Tags.user_id == user_id, Tags.name == name)
        return self.session.scalar(stmt)

    def get_all_by_user(self, user_id: int) -> Sequence[Tags]:
        stmt = select(Tags).where(Tags.user_id == user_id).order_by(Tags.name.asc())
        return self.session.scalars(stmt).all()

    def get_by_ids(self, tag_ids: list[int], user_id: int) -> Sequence[Tags]:
        if not tag_ids:
            return []
        stmt = (
            select(Tags)
            .where(Tags.user_id == user_id, Tags.tag_id.in_(tag_ids))
            .order_by(Tags.name.asc())
        )
        return self.session.scalars(stmt).all()
