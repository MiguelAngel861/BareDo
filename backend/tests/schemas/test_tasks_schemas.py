import pytest
from pydantic import ValidationError

from app.api.v1.schemas.tasks_schemas import TaskListQuery


def test_completed_empty_query_means_no_filter():
    assert TaskListQuery(completed="").completed is None


def test_completed_bool_strings_are_coerced_by_pydantic():
    assert TaskListQuery(completed="true").completed is True
    assert TaskListQuery(completed="False").completed is False
    assert TaskListQuery(completed="1").completed is True


def test_completed_invalid_value_rejected():
    with pytest.raises(ValidationError):
        TaskListQuery(completed="maybe")
