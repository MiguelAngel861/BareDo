from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity

from app.models.users import Users
from app.repositories.users_repository import UsersRepository
from app.services.base import BaseService


class AuthService(BaseService):
    @property
    def repository_class(self) -> type[UsersRepository]:
        return UsersRepository

    def issue_access_token(self, user: Users) -> str:
        return create_access_token(identity=str(user.user_id))

    def issue_refresh_token(self, user: Users) -> str:
        return create_refresh_token(identity=str(user.user_id))

    def register(self, username: str, password: str) -> Users:
        user = Users(username=username)
        user.set_password(password)
        return self._execute_in_transaction(lambda repo: repo.create(user))

    def login(self, username: str, password: str) -> Users | None:
        user = self._execute_in_transaction(lambda repo: repo.get_by_username(username))
        if user and user.check_password(password):
            return user
        return None

    def get_user_by_id(self, user_id) -> Users | None:
        return self._execute_in_transaction(lambda repo: repo.get_by_id(int(user_id)))

    def get_current_user(self) -> Users | None:
        user_id = get_jwt_identity()
        return self.get_user_by_id(user_id) if user_id else None
