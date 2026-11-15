from app.core.middleware import _mask_sensitive, _truncate


def test_mask_sensitive_masks_case_insensitively_and_recursively():
    data = {"Password": "x", "nested": {"token": "y", "keep": 1}, "list": [{"Authorization": "z"}]}
    assert _mask_sensitive(data) == {
        "Password": "***",
        "nested": {"token": "***", "keep": 1},
        "list": [{"Authorization": "***"}],
    }


def test_mask_sensitive_leaves_plain_values_alone():
    data = {"title": "Comprar pan", "user_id": 1, "completed": True}
    assert _mask_sensitive(data) == data


def test_truncate_strings_and_keeps_non_strings():
    data = {"a": "x" * 20, "b": 5, "c": ["y" * 20], "d": None}
    assert _truncate(data, 10) == {"a": "x" * 10 + "…", "b": 5, "c": ["y" * 10 + "…"], "d": None}
