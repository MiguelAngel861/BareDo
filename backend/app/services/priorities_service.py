from app.models.priorities import Priorities
from app.repositories.priorities_repository import PrioritiesRepository
from app.services.base import BaseService


class PrioritiesService(BaseService):
    @property
    def repository_class(self) -> type[PrioritiesRepository]:
        return PrioritiesRepository

    def get_all_priorities(self) -> list[Priorities]:
        return self._execute_in_transaction(lambda repo: repo.get_all_ordered())
