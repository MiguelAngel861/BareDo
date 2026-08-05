from pydantic import BaseModel, ConfigDict, Field, EmailStr


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)

    model_config = ConfigDict(extra="forbid")


class UserLogin(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)

    model_config = ConfigDict(extra="forbid")


class UserResponse(BaseModel):
    user_id: int
    username: str
    created_at: str

    model_config = ConfigDict(from_attributes=True, extra="forbid")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

    model_config = ConfigDict(extra="forbid")