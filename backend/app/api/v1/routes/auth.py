from flask import Blueprint, abort
from flask_jwt_extended import jwt_required

from app.api.helpers import get_current_user_id, build_token_response, validate_body
from app.api.v1.schemas.auth_schemas import UserCreate, UserLogin, UserResponse
from app.core.extensions import limiter
from app.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)
auth_service = AuthService()


@auth_bp.post("/register")
@validate_body(UserCreate)
def register(user_data: UserCreate):
    user = auth_service.register(user_data.username, user_data.password)
    return build_token_response(user), 201


@auth_bp.post("/login")
@validate_body(UserLogin)
@limiter.limit("5 per minute")
def login(user_data: UserLogin):
    user = auth_service.login(user_data.username, user_data.password)
    if not user:
        abort(401, "Invalid credentials")
    return build_token_response(user), 200


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user_id = get_current_user_id()
    user = auth_service.get_user_by_id(user_id)
    if not user:
        abort(404, "User not found")
    return build_token_response(user), 200


@auth_bp.get("/me")
@jwt_required()
def get_me():
    user = auth_service.get_current_user()
    if not user:
        abort(404, "User not found")
    return UserResponse(
        user_id=user.user_id,
        username=user.username,
        created_at=user.created_at.isoformat() if user.created_at else "",
    ).model_dump(), 200
