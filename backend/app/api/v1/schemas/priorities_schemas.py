from pydantic import BaseModel, ConfigDict


class PriorityBody(BaseModel):
    priority_id: int
    name: str
    level: int
    description: str | None

    model_config = ConfigDict(from_attributes=True, extra="forbid")


class PriorityResponse(BaseModel):
    priorities: list[PriorityBody]

    model_config = ConfigDict(from_attributes=True, extra="forbid")
