import pytest

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
