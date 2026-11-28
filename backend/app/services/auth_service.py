from werkzeug.security import check_password_hash

from app.errors.exceptions import ConflictError, DataValidationError
from app.models.users import Users
from app.repositories.users_repository import UsersRepository
from app.services.base import BaseService

# Hash ficticio para comparar en tiempo constante cuando el usuario no existe,
# evitando ataques de enumeración por timing (login de usuario inexistente es
# mediblemente más rápido si se salta la comprobación de contraseña).
# Debe usar el mismo algoritmo que los hashes reales de usuarios (scrypt, Werkzeug 3.1 default)
# para que no exista diferencia de timing ni un dummy más caro que un login real.
_DUMMY_HASH = (
    "scrypt:32768:8:1$h5Tl0UHRlIONqCa9$"
    "aa85fd7e8e2857a3da76666b30e59bd6903521e15ab0cb48586052dc6e584c65d9fafdbfbe4a6ec08c4c9b05c242fc60fe8592b82018ca68d8ff1a64a683bb7c"
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
        except (DataValidationError, ConflictError) as exc:
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
