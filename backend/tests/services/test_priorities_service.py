import pytest

from app.errors.exceptions import NotFoundError
from app.services.priorities_service import PrioritiesService


@pytest.fixture
def priorities_service():
    return PrioritiesService()


def test_get_all_priorities_returns_all(priorities_service):
    priorities = priorities_service.get_all_priorities()

    assert len(priorities) == 5


def test_get_all_priorities_sorted_by_level(priorities_service):
    priorities = priorities_service.get_all_priorities()

    levels = [p.level for p in priorities]
    assert levels == [1, 2, 3, 4, 5]


def test_get_priority_by_id_returns_priority(priorities_service):
    priority = priorities_service.get_priority_by_id(1)

    assert priority is not None
    assert priority.name == "Low"
    assert priority.level == 1


def test_get_priority_by_id_raises_not_found(priorities_service):
    with pytest.raises(NotFoundError):
        priorities_service.get_priority_by_id(999)


def test_get_priority_by_id_high_priority(priorities_service):
    priority = priorities_service.get_priority_by_id(5)

    assert priority is not None
    assert priority.name == "High"
    assert priority.level == 5
