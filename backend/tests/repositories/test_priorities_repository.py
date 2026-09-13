import pytest

from app.repositories.priorities_repository import PrioritiesRepository


@pytest.fixture
def priorities_repo(db_session):
    return PrioritiesRepository(db_session)


def test_get_all_returns_all_priorities(priorities_repo):
    priorities = priorities_repo.get_all()

    assert len(priorities) == 5
    assert [p.level for p in priorities] == [1, 2, 3, 4, 5]


def test_get_all_sorted_by_level(priorities_repo):
    priorities = priorities_repo.get_all()

    levels = [p.level for p in priorities]
    assert levels == sorted(levels)


def test_get_by_id_returns_priority(priorities_repo):
    priority = priorities_repo.get_by_id(1)

    assert priority is not None
    assert priority.name == "Low"
    assert priority.level == 1


def test_get_by_id_returns_none_for_invalid(priorities_repo):
    priority = priorities_repo.get_by_id(999)

    assert priority is None


def test_get_by_level_returns_priority(priorities_repo):
    priority = priorities_repo.get_by_level(5)

    assert priority is not None
    assert priority.name == "High"
    assert priority.priority_id == 5


def test_get_by_level_returns_none_for_invalid(priorities_repo):
    priority = priorities_repo.get_by_level(999)

    assert priority is None


def test_priorities_have_required_fields(priorities_repo):
    priorities = priorities_repo.get_all()

    for priority in priorities:
        assert hasattr(priority, "priority_id")
        assert hasattr(priority, "name")
        assert hasattr(priority, "level")
        assert hasattr(priority, "description")
        assert priority.priority_id is not None
        assert priority.name is not None
        assert priority.level is not None
