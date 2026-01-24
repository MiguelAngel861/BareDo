from pydantic import BaseModel

class ErrorBase(BaseModel):
    code: str
    message: str | None
    status: int
    details: str | None = None
    
class ErrorResponse(BaseModel):
    error: ErrorBase
    