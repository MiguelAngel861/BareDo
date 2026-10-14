from datetime import UTC, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.api.v1.schemas.subtasks_schemas import SubtaskBody, SubtaskCreate
from app.api.v1.schemas.tags_schemas import TagBody


class TaskBase(BaseModel):
    title: str = Field(min_length=5, max_length=40)
    description: str = Field(default="", min_length=0, max_length=500)
    priority_id: int = Field(default=3, ge=1, le=5)


class TaskBody(TaskBase):
    task_id: int
    user_id: int
    completed: bool
    due_date: datetime
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    tags: list[TagBody] = Field(default_factory=list)
    subtasks: list[SubtaskBody] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True, extra="forbid")


class TaskResponse(BaseModel):
    tasks: list[TaskBody]
    meta: dict

    model_config = ConfigDict(from_attributes=True, extra="forbid")


class TaskCreate(TaskBase):
    completed: bool = Field(default=False)
    due_date: datetime = Field(default_factory=lambda: datetime.now(UTC))
    tag_ids: list[int] | None = Field(default=None, max_length=7)
    subtasks: list[SubtaskCreate] | None = Field(default=None)

    model_config = ConfigDict(extra="forbid")


class TaskUpdate(TaskBase):
    completed: bool
    due_date: datetime
    tag_ids: list[int] | None = Field(default=None, max_length=7)

    model_config = ConfigDict(extra="forbid")


class TaskPatch(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=40)
    description: str | None = Field(default=None, min_length=0, max_length=500)
    completed: bool | None = None
    priority_id: int | None = Field(default=None, ge=1, le=5)
    due_date: datetime | None = None
    tag_ids: list[int] | None = Field(default=None, max_length=7)

    model_config = ConfigDict(extra="forbid")


class TaskListQuery(BaseModel):
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=100, ge=1, le=100)
    sort: str | None = None
    title: str | None = None
    description: str | None = None
    completed: bool | None = None
    priority_id: int | None = Field(default=None, ge=1, le=5)
    tag_ids: str | None = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("completed", mode="before")
    @classmethod
    def validate_completed(cls, v):
        if isinstance(v, str):
            if v == "":
                return None
            lower = v.lower()
            if lower == "true":
                return True
            elif lower == "false":
                return False
            else:
                raise ValueError(f"Invalid value for completed: '{v}'. Must be 'true' or 'false'.")
        return v

    @field_validator("title", mode="before")
    @classmethod
    def validate_title(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

    def get_parsed_tag_ids(self) -> list[int] | None:
        if not self.tag_ids:
            return None
        try:
            parsed = [int(item.strip()) for item in self.tag_ids.split(",") if item.strip()]
            return parsed if parsed else None
        except ValueError:
            return None


class TaskPath(BaseModel):
    task_id: int = Field(description="ID of the task")


class TrashCountResponse(BaseModel):
    count: int

    model_config = ConfigDict(extra="forbid")


class TrashListQuery(BaseModel):
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=100, ge=1, le=100)
    sort: str | None = None

    model_config = ConfigDict(extra="forbid")
