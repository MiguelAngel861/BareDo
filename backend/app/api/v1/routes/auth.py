from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required

from app.api.blueprint import BareDoBlueprint
from app.api.helpers import get_current_user_id
from app.api.v1.schemas.auth_schemas import TokenResponse, UserCreate, UserLogin, UserResponse
from app.core.extensions import limiter
from app.errors.exceptions import NotFoundError, UnauthorizedError
from app.models.users import Users
from app.services.auth_service import AuthService

auth_bp = BareDoBlueprint("auth", __name__, url_prefix="/api/v1/auth")
auth_service = AuthService()


def _issue_tokens(user: Users) -> tuple[str, str]:
    identity = str(user.user_id)
    return create_access_token(identity=identity), create_refresh_token(identity=identity)


@auth_bp.post("/register")
def register(body: UserCreate):
    """Register a new user."""
    user = auth_service.register(body.username, body.password)
    access_token, refresh_token = _issue_tokens(user)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    ), 201


@auth_bp.post("/login")
@limiter.limit("5 per minute")
def login(body: UserLogin):
    """Login and get tokens."""
    user = auth_service.login(body.username, body.password)
    if not user:
        raise UnauthorizedError("Invalid credentials")
    access_token, refresh_token = _issue_tokens(user)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    ), 200


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    """Refresh access token."""
    user_id = get_current_user_id()
    user = auth_service.get_user_by_id(user_id)
    if not user:
        raise NotFoundError("User not found")
    access_token, refresh_token = _issue_tokens(user)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    ), 200


@auth_bp.get("/me")
@jwt_required()
def get_me():
    """Get current user profile."""
    user_id = get_current_user_id()
    user = auth_service.get_user_by_id(user_id)
    if not user:
        raise NotFoundError("User not found")
    return UserResponse.model_validate(user), 200
