from app.errors.exceptions import NotFoundError
from app.models.priorities import Priorities
from app.repositories.priorities_repository import PrioritiesRepository
from app.services.base import BaseService


class PrioritiesService(BaseService):
    @property
    def repository_class(self) -> type[PrioritiesRepository]:
        return PrioritiesRepository

    def get_all_priorities(self) -> list[Priorities]:
        return self._execute_in_transaction(lambda repo: repo.get_all())

    def get_priority_by_id(self, priority_id: int) -> Priorities:
        priority = self._execute_in_transaction(lambda repo: repo.get_by_id(priority_id))
        if not priority:
            raise NotFoundError()
        return priority
