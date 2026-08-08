from functools import wraps
from typing import TypeVar

from flask import abort, request
from flask_jwt_extended import get_jwt_identity
from pydantic import BaseModel, ValidationError


def get_current_user_id() -> int:
    """Get current user ID from JWT token."""
    user_id = get_jwt_identity()
    if not user_id:
        abort(401, "Invalid token")
    return int(user_id)


T = TypeVar("T", bound=BaseModel)


def validate_body[T: BaseModel](schema_class: type[T]):
    """Decorator to validate request JSON against a Pydantic schema."""

    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            payload = request.get_json(silent=True) or {}
            try:
                validated = schema_class(**payload)
            except ValidationError as e:
                abort(400, str(e))
            return f(validated, *args, **kwargs)

        return wrapped

    return decorator
