from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.repositories.base import BaseRepository
from app.models.users import Users


class UsersRepository(BaseRepository[Users]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Users)

    def get_by_username(self, username: str) -> Users | None:
        stmt = select(Users).where(Users.username == username)

        return self.session.scalar(stmt)
