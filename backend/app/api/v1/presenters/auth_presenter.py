from app.api.v1.schemas.auth_schemas import TokenResponse, UserResponse
from app.models.users import Users


def present_user(user: Users) -> dict:
    return UserResponse.model_validate(user).model_dump(mode="json")


def present_token_response(user: Users) -> dict:
    return TokenResponse(
        access_token=user.issue_access_token(),
        refresh_token=user.issue_refresh_token(),
        user=UserResponse.model_validate(user),
    ).model_dump(mode="json")
