from app.models.users import Users
from app.repositories.users_repository import UsersRepository
from app.services.base import BaseService


class AuthService(BaseService):
    @property
    def repository_class(self) -> type[UsersRepository]:
        return UsersRepository

    def register(self, username: str, password: str) -> Users:
        user = Users(username=username)
        user.set_password(password)
        return self._execute_in_transaction(lambda repo: repo.create(user))

    def login(self, username: str, password: str) -> Users | None:
        user = self._execute_in_transaction(lambda repo: repo.get_by_username(username))
        if user and user.check_password(password):
            return user
        return None

    def get_user_by_id(self, user_id: int) -> Users | None:
        return self._execute_in_transaction(lambda repo: repo.get_by_id(int(user_id)))
