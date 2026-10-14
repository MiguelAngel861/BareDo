from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SubtaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=120)


class SubtaskCreate(SubtaskBase):
    completed: bool = Field(default=False)

    model_config = ConfigDict(extra="forbid")


class SubtaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    completed: bool | None = None

    model_config = ConfigDict(extra="forbid")


class SubtaskBody(SubtaskBase):
    subtask_id: int
    task_id: int
    completed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, extra="forbid")


class SubtaskPath(BaseModel):
    task_id: int = Field(description="ID of the parent task")
    subtask_id: int = Field(description="ID of the subtask")


class SubtaskListResponse(BaseModel):
    subtasks: list[SubtaskBody]

    model_config = ConfigDict(from_attributes=True, extra="forbid")
