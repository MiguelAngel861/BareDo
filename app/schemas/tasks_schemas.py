from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskBase(BaseModel):
    title: str = Field(min_length=5, max_length=40)
    description: str | None = Field(default="", min_length=0, max_length=500)

    # Compatibility with ORM models
    model_config = ConfigDict(from_attributes=True)


class TaskResponse(TaskBase):
    task_id: int
    completed: bool
    created_at: datetime

    # Compatibility with ORM models
    model_config = ConfigDict(from_attributes=True)


class TaskCreate(TaskBase):
    completed: bool = Field(default=False)


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=40)
    description: str | None = Field(default=None, min_length=0, max_length=500)
    completed: bool | None = Field(default=None)

    # Compatibility with ORM models
    model_config = ConfigDict(from_attributes=True)

    def has_changes(self) -> bool:
        return any(
            value is not None for value in self.model_dump(exclude_unset=True).values()
        )
