from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field


class TaskBase(BaseModel):
    title: str = Field(min_length=5, max_length=40)
    description: str = Field(default="", min_length=0, max_length=500)
    priority: int = Field(default=1, ge=1, le=5)


class TaskResponse(TaskBase):
    task_id: int
    completed: bool
    due_date: datetime
    created_at: datetime
    updated_at: datetime

    # Compatibility with ORM models
    model_config = ConfigDict(from_attributes=True)


class TaskCreate(TaskBase):
    completed: bool = Field(default=False)
    due_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TaskUpdate(BaseModel):
    title: str = Field(min_length=5, max_length=40)
    description: str = Field(min_length=0, max_length=500)
    completed: bool
    priority: int = Field(ge=1, le=3)
    due_date: datetime = Field()


class TaskPatch(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=40)
    description: str | None = Field(default=None, min_length=0, max_length=500)
    completed: bool | None = Field(default=None)
    priority: int | None = Field(default=None, ge=1, le=3)
    due_date: datetime | None = Field(default=None)
