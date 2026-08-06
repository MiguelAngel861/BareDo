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


def build_token_response(user) -> dict:
    """Build token response envelope from user ORM object."""
    from app.api.v1.schemas.auth_schemas import TokenResponse, UserResponse

    return TokenResponse(
        access_token=user.issue_access_token(),
        refresh_token=user.issue_refresh_token(),
        user=UserResponse(
            user_id=user.user_id,
            username=user.username,
            created_at=user.created_at.isoformat() if user.created_at else "",
        ),
    ).model_dump()


T = TypeVar("T", bound=BaseModel)


def validate_body(schema_class: type[T]):
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
