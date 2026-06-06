from pydantic import BaseModel
from typing import Any

class ErrorPayload(BaseModel):
    code: str
    message: str | None
    status: int
    details: Any | None = None
    
class ErrorResponse(BaseModel):
    error: ErrorPayload

def api_error(code: str, message: str | None, status: int, details: Any | None):
    payload: ErrorPayload = ErrorPayload(code=code, message=message, status=status, details=details)
    error_response: ErrorResponse = ErrorResponse(error=payload)
    
    return error_response.model_dump(), status