from app.core.db import transactional
from app.errors.exceptions import DatabaseError, NotFoundError
from app.repositories.base import BaseRepository


class BaseService:
    @property
    def repository_class(self) -> type[BaseRepository]:
        raise NotImplementedError("Subclasses must define repository_class")

    def _get_repo(self, session) -> BaseRepository:
        return self.repository_class(session)

    def _execute_in_transaction(self, fn):
        with transactional() as session:
            repo = self._get_repo(session)
            try:
                return fn(repo)
            except NotFoundError:
                raise
            except DatabaseError:
                raise
            except Exception as exc:
                raise DatabaseError(str(exc)) from exc
