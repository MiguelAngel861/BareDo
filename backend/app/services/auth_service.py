from werkzeug.security import check_password_hash

from app.errors.exceptions import ConflictError, DataValidationError
from app.models.users import Users
from app.repositories.users_repository import UsersRepository
from app.services.base import BaseService

# Hash ficticio para comparar en tiempo constante cuando el usuario no existe,
# evitando ataques de enumeración por timing (login de usuario inexistente es
# mediblemente más rápido si se salta la comprobación de contraseña).
_DUMMY_HASH = (
    "pbkdf2:sha256:600000$dummy$"
    "0000000000000000000000000000000000000000000000000000000000000000"
)


class AuthService(BaseService):
    @property
    def repository_class(self) -> type[UsersRepository]:
        return UsersRepository

    def register(self, username: str, password: str) -> Users:
        user = Users(username=username)
        user.set_password(password)
        try:
            return self._execute_in_transaction(lambda repo: repo.create(user))
        except DataValidationError as exc:
            raise ConflictError("Username already in use") from exc

    def login(self, username: str, password: str) -> Users | None:
        user = self._execute_in_transaction(lambda repo: repo.get_by_username(username))
        # Siempre comprobamos la contraseña (incluso si el usuario no existe)
        # para evitar timing attacks de enumeración de usuarios.
        if user is None:
            check_password_hash(_DUMMY_HASH, password)
            return None
        if user.check_password(password):
            return user
        return None

    def get_user_by_id(self, user_id: int) -> Users | None:
        return self._execute_in_transaction(lambda repo: repo.get_by_id(int(user_id)))
