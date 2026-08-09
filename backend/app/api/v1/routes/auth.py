from flask import Blueprint, abort, request
from flask_jwt_extended import jwt_required

from app.api.helpers import get_current_user_id
from app.api.v1.presenters.auth_presenter import present_token_response, present_user
from app.api.v1.schemas.auth_schemas import UserCreate, UserLogin
from app.core.extensions import limiter
from app.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)
auth_service = AuthService()


@auth_bp.post("/register")
def register():
    """Register a new user.

    responses:
      201:
        description: User registered with tokens
      400:
        description: Bad request
    """
    payload = request.get_json(silent=True) or {}
    try:
        user_data = UserCreate(**payload)
    except Exception as e:
        abort(400, str(e))

    user = auth_service.register(user_data.username, user_data.password)
    return present_token_response(user), 201


@auth_bp.post("/login")
@limiter.limit("5 per minute")
def login():
    """Login and get tokens.

    responses:
      200:
        description: Login successful with tokens
      401:
        description: Invalid credentials
    """
    payload = request.get_json(silent=True) or {}
    try:
        user_data = UserLogin(**payload)
    except Exception as e:
        abort(400, str(e))

    user = auth_service.login(user_data.username, user_data.password)
    if not user:
        abort(401, "Invalid credentials")
    return present_token_response(user), 200


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    """Refresh access token.

    responses:
      200:
        description: New tokens
      401:
        description: Unauthorized
      404:
        description: User not found
    """
    user_id = get_current_user_id()
    user = auth_service.get_user_by_id(user_id)
    if not user:
        abort(404, "User not found")
    return present_token_response(user), 200


@auth_bp.get("/me")
@jwt_required()
def get_me():
    """Get current user profile.

    responses:
      200:
        description: User profile
      401:
        description: Unauthorized
      404:
        description: User not found
    """
    user = auth_service.get_current_user()
    if not user:
        abort(404, "User not found")
    return present_user(user), 200
