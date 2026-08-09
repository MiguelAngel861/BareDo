from datetime import UTC, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TaskBase(BaseModel):
    title: str = Field(min_length=5, max_length=40)
    description: str = Field(default="", min_length=0, max_length=500)
    priority: int = Field(default=1, ge=1, le=3)


class TaskBody(TaskBase):
    task_id: int
    user_id: int
    completed: bool
    due_date: datetime
    created_at: datetime
    updated_at: datetime

    # Compatibility with ORM models
    model_config = ConfigDict(from_attributes=True, extra="forbid")


class TaskResponse(BaseModel):
    tasks: list[TaskBody]
    meta: dict

    # Compatibility with ORM models
    model_config = ConfigDict(from_attributes=True, extra="forbid")


class TaskCreate(TaskBase):
    completed: bool = Field(default=False)
    due_date: datetime = Field(default_factory=lambda: datetime.now(UTC))

    model_config = ConfigDict(extra="forbid")


class TaskUpdate(TaskBase):
    completed: bool
    due_date: datetime

    model_config = ConfigDict(extra="forbid")


class TaskPatch(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=40)
    description: str | None = Field(default=None, min_length=0, max_length=500)
    completed: bool | None = None
    priority: int | None = Field(default=None, ge=1, le=3)
    due_date: datetime | None = None

    model_config = ConfigDict(extra="forbid")


class TaskListQuery(BaseModel):
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=100, ge=1, le=100)
    sort: str | None = None
    title: str | None = None
    description: str | None = None
    completed: bool | None = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("completed", mode="before")
    @classmethod
    def validate_completed(cls, v):
        if isinstance(v, str):
            lower = v.lower()
            if lower == "true":
                return True
            elif lower == "false":
                return False
            else:
                raise ValueError(f"Invalid value for completed: '{v}'. Must be 'true' or 'false'.")
        return v
