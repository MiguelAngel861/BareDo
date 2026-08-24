from sqlalchemy import select

from app.models.users import Users
from app.repositories.base import BaseRepository


class UsersRepository(BaseRepository[Users]):
    sortable_columns = {"username": Users.username, "created_at": Users.created_at}

    def __init__(self, session) -> None:
        super().__init__(session, Users)

    def apply_filters(self, stmt, filters: dict):
        if not filters:
            return stmt

        if username := filters.get("username"):
            stmt = stmt.where(Users.username.ilike(f"%{username}%"))

        return stmt

    def get_by_username(self, username: str) -> Users | None:
        stmt = select(Users).where(Users.username == username)
        return self.session.scalar(stmt)
