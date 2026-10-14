from pydantic import BaseModel, ConfigDict, Field


class TagBody(BaseModel):
    tag_id: int
    name: str

    model_config = ConfigDict(from_attributes=True, extra="forbid")


class TagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=30)

    model_config = ConfigDict(extra="forbid")


class TagListResponse(BaseModel):
    tags: list[TagBody]

    model_config = ConfigDict(from_attributes=True, extra="forbid")


class TagUpdate(TagCreate):
    pass


class TagPath(BaseModel):
    tag_id: int = Field(ge=1)
