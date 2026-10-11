from flask_jwt_extended import get_jwt_identity

from app.errors.exceptions import UnauthorizedError


def get_current_user_id() -> int:
    """Get current user ID from JWT token."""
    user_id = get_jwt_identity()
    if not user_id:
        raise UnauthorizedError("Invalid token")
    return int(user_id)
