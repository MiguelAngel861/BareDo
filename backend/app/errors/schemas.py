from typing import Any

from pydantic import BaseModel


class ErrorPayload(BaseModel):
    code: str
    message: str | None
    status: int
    details: Any | None = None


def api_error(code: str, message: str | None, status: int, details: Any | None):
    payload: ErrorPayload = ErrorPayload(code=code, message=message, status=status, details=details)

    return payload.model_dump(), status
