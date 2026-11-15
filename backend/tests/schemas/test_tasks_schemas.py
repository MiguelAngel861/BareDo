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


def test_tag_ids_list_format_parsed_to_ints():
    assert TaskListQuery(tag_ids=["1", "2", "3"]).tag_ids == [1, 2, 3]


def test_tag_ids_empty_items_mean_no_filter():
    assert TaskListQuery(tag_ids=[""]).tag_ids is None
    assert TaskListQuery(tag_ids=["", " "]).tag_ids is None


def test_tag_ids_invalid_item_rejected():
    with pytest.raises(ValidationError):
        TaskListQuery(tag_ids=["1", "abc"])


def test_tag_ids_comma_string_rejected_list_format_only():
    with pytest.raises(ValidationError):
        TaskListQuery(tag_ids="5,7")
