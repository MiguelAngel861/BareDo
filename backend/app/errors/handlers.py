from flask import Flask
from werkzeug.exceptions import HTTPException
from pydantic import ValidationError as PydanticValidationError

from app.errors.schemas import api_error
from app.errors.exceptions import DataValidationError, DatabaseError, NotFoundError


def register_error_handlers(app: Flask):
    @app.errorhandler(400)
    def bad_request(error: HTTPException):
        message = error.description or "Bad Request"

        return api_error(
            code="BAD_REQUEST", message=message, status=400, details=str(error)
        )

    @app.errorhandler(401)
    def unauthorized(error: HTTPException):
        message = error.description or "Athenticaution Required"

        return api_error(
            code="AUTHENTICATION_ERROR", message=message, status=401, details=str(error)
        )

    @app.errorhandler(403)
    def forbidden_error(error: HTTPException):
        message = error.description or "Acces Denied"

        return api_error(
            code="FORBIDDEN", message=message, status=403, details=str(error)
        )

    @app.errorhandler(404)
    def not_found(error: HTTPException):
        message = error.description or "Resource Not Found"

        return api_error(
            code="NOT_FOUND", message=message, status=404, details=str(error)
        )

    @app.errorhandler(500)
    def internal_server_error(error: HTTPException):
        message = error.description or "Internal Server Error"

        return api_error(
            code="INTERNAL_ERROR", message=message, status=500, details=str(error)
        )

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

    @app.errorhandler(DatabaseError)
    def database_error_handler(error: DatabaseError):
        return api_error(
            code="INTERNAL_ERROR",
            message="Database error",
            status=500,
            details=str(error),
        )
