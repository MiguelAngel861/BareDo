import inspect
import typing

from flask import Flask, current_app, make_response, request
from flask_jwt_extended import JWTManager
from pydantic import ValidationError as PydanticValidationError
from werkzeug.exceptions import HTTPException

from app.errors.exceptions import (
    DatabaseError,
    DataValidationError,
    NotFoundError,
    UnauthorizedError,
)
from app.errors.schemas import api_error


def _sanitize_pydantic_errors(errors: list[dict]) -> list[dict]:
    clean = []
    for err in errors:
        c = dict(err)
        if "ctx" in c and isinstance(c["ctx"], dict):
            c["ctx"] = {k: str(v) if isinstance(v, Exception) else v for k, v in c["ctx"].items()}
        clean.append(c)
    return clean


def openapi_validation_error_callback(error: PydanticValidationError):
    hints = {}
    if request.endpoint and request.endpoint in current_app.view_functions:
        vf = current_app.view_functions[request.endpoint]
        original = inspect.unwrap(vf)
        try:
            hints = typing.get_type_hints(original)
        except Exception:
            hints = {}

    param_type = "body_params"
    for k, v in hints.items():
        if getattr(v, "__name__", "") == error.title:
            param_type = f"{k}_params"
            break

    raw_errors = _sanitize_pydantic_errors(error.errors())
    details = {
        "body_params": raw_errors if param_type == "body_params" else None,
        "query_params": raw_errors if param_type == "query_params" else None,
        "path_params": raw_errors if param_type == "path_params" else None,
        "form_params": raw_errors if param_type == "form_params" else None,
    }
    res, status = api_error(
        code="VALIDATION_ERROR",
        message="Request validation failed",
        status=422,
        details=details,
    )
    return make_response(res, status)


def register_error_handlers(app: Flask):
    @app.errorhandler(400)
    def bad_request(error: HTTPException):
        message = error.description or "Bad Request"

        return api_error(code="BAD_REQUEST", message=message, status=400, details=str(error))

    @app.errorhandler(401)
    def unauthorized(error: HTTPException):
        message = error.description or "Authentication Required"

        return api_error(
            code="AUTHENTICATION_ERROR", message=message, status=401, details=str(error)
        )

    @app.errorhandler(403)
    def forbidden_error(error: HTTPException):
        message = error.description or "Access Denied"

        return api_error(code="FORBIDDEN", message=message, status=403, details=str(error))

    @app.errorhandler(404)
    def not_found(error: HTTPException):
        message = error.description or "Resource Not Found"

        return api_error(code="NOT_FOUND", message=message, status=404, details=str(error))

    @app.errorhandler(500)
    def internal_server_error(error: HTTPException):
        message = error.description or "Internal Server Error"

        return api_error(code="INTERNAL_ERROR", message=message, status=500, details=str(error))

    @app.errorhandler(PydanticValidationError)
    def validation_error_handler(error: PydanticValidationError):
        return api_error(
            code="BAD_REQUEST",
            message="Invalid payload",
            status=400,
            details=str(error),
        )

    @app.errorhandler(DataValidationError)
    def domain_validation_error_handler(error: DataValidationError):
        return api_error(
            code="BAD_REQUEST",
            message=str(error),
            status=400,
            details=None,
        )

    @app.errorhandler(NotFoundError)
    def not_found_error_handler(error: NotFoundError):
        return api_error(
            code="NOT_FOUND",
            message=str(error) or "Resource Not Found",
            status=404,
            details=None,
        )

    @app.errorhandler(UnauthorizedError)
    def unauthorized_error_handler(error: UnauthorizedError):
        return api_error(
            code="AUTHENTICATION_ERROR",
            message=str(error) or "Authentication Required",
            status=401,
            details=None,
        )

    @app.errorhandler(DatabaseError)
    def database_error_handler(error: DatabaseError):
        return api_error(
            code="INTERNAL_ERROR",
            message="Database error",
            status=500,
            details=str(error),
        )


def register_jwt_handlers(jwt: JWTManager):
    """Register custom JWT error handlers to match our error envelope format."""

    @jwt.unauthorized_loader
    def unauthorized_callback(reason):
        return api_error(
            code="AUTHENTICATION_ERROR",
            message="Missing Authorization Header",
            status=401,
            details=reason,
        )

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return api_error(
            code="AUTHENTICATION_ERROR",
            message="Invalid token",
            status=401,
            details=reason,
        )

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return api_error(
            code="AUTHENTICATION_ERROR",
            message="Token has expired",
            status=401,
            details="Token expired",
        )
