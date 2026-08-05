from flask import Blueprint, abort, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from pydantic import ValidationError

from app.api.v1.schemas.auth_schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
)
from app.api.v1.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)
auth_service = AuthService()


@auth_bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}
    try:
        user_data = UserCreate(**payload)
    except ValidationError as e:
        abort(400, str(e))

    try:
        user = auth_service.register(user_data.username, user_data.password)
    except Exception as e:
        abort(400, str(e))

    access_token = auth_service.create_token(user["user_id"])
    response = TokenResponse(
        access_token=access_token,
        user=UserResponse(
            user_id=user["user_id"],
            username=user["username"],
            created_at=user["created_at"].isoformat() if user["created_at"] else "",
        ),
    )
    return response.model_dump(), 201


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    try:
        user_data = UserLogin(**payload)
    except ValidationError as e:
        abort(400, str(e))

    user = auth_service.login(user_data.username, user_data.password)
    if not user:
        abort(401, "Invalid credentials")

    access_token = auth_service.create_token(user["user_id"])
    response = TokenResponse(
        access_token=access_token,
        user=UserResponse(
            user_id=user["user_id"],
            username=user["username"],
            created_at=user["created_at"].isoformat() if user["created_at"] else "",
        ),
    )
    return response.model_dump(), 200


@auth_bp.get("/me")
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    if not user_id:
        abort(401, "Invalid token")

    user = auth_service.get_current_user()
    if not user:
        abort(404, "User not found")

    return UserResponse(
        user_id=user["user_id"],
        username=user["username"],
        created_at=user["created_at"].isoformat() if user["created_at"] else "",
    ).model_dump(), 200