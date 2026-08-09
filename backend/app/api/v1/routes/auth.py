from flask import Blueprint
from flask_jwt_extended import jwt_required
from flask_pydantic import validate

from app.api.helpers import get_current_user_id
from app.api.v1.schemas.auth_schemas import TokenResponse, UserCreate, UserLogin, UserResponse
from app.core.extensions import limiter
from app.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)
auth_service = AuthService()


@auth_bp.post("/register")
@validate(body=UserCreate)
def register(body: UserCreate):
    """Register a new user."""
    user = auth_service.register(body.username, body.password)
    return TokenResponse(
        access_token=user.issue_access_token(),
        refresh_token=user.issue_refresh_token(),
        user=UserResponse.model_validate(user),
    ), 201


@auth_bp.post("/login")
@limiter.limit("5 per minute")
@validate(body=UserLogin)
def login(body: UserLogin):
    """Login and get tokens."""
    user = auth_service.login(body.username, body.password)
    if not user:
        return {"error": "Invalid credentials"}, 401
    return TokenResponse(
        access_token=user.issue_access_token(),
        refresh_token=user.issue_refresh_token(),
        user=UserResponse.model_validate(user),
    ), 200


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
@validate()
def refresh():
    """Refresh access token."""
    user_id = get_current_user_id()
    user = auth_service.get_user_by_id(user_id)
    if not user:
        return {"error": "User not found"}, 404
    return TokenResponse(
        access_token=user.issue_access_token(),
        refresh_token=user.issue_refresh_token(),
        user=UserResponse.model_validate(user),
    ), 200


@auth_bp.get("/me")
@jwt_required()
@validate()
def get_me():
    """Get current user profile."""
    user = auth_service.get_current_user()
    if not user:
        return {"error": "User not found"}, 404
    return UserResponse.model_validate(user), 200
