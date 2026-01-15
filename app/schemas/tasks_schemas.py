from datetime import datetime
from pydantic import BaseModel, Field

class TaskBase(BaseModel):
    title: str = Field(min_length = 5, max_length = 40)
    description: str | None = Field(default = None, min_length = 0, max_length = 500)
    
class TaskResponse(TaskBase):
    task_id: int
    completed: bool
    created_at: datetime
    
    class Config:
        from_attribures = True
        orm_mode = True

class TaskCreate(TaskBase):
    completed: bool = Field(default = False)

class TaskUpdate(BaseModel):
    title: str | None = Field(default = None, min_length = 5, max_length = 40)
    description: str | None = Field(default = None, min_length = 0, max_length = 500)
    completed: bool | None = Field(default = None)