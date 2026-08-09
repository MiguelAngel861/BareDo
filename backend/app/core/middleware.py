from datetime import datetime
from typing import Any
from uuid import uuid4

from flask import Flask, g, request

SENSITIVE_FIELDS = {
    "password",
    "token",
    "refresh_token",
    "secret",
    "authorization",
    "otp",
}


def _mask_sensitive(data: Any) -> Any:
    """Recursively mask sensitive fields in dicts and lists."""
    if isinstance(data, dict):
        return {
            k: "***" if k.lower() in SENSITIVE_FIELDS else _mask_sensitive(v)
            for k, v in data.items()
        }
    if isinstance(data, list):
        return [_mask_sensitive(item) for item in data]
    return data


def register_middleware(app: Flask):
    """Register security headers and request/response logging middleware."""

    @app.after_request
    def add_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        if request.is_secure:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

    @app.before_request
    def log_request():
        g.request_id = uuid4().hex
        request._start_time = datetime.utcnow()

    @app.after_request
    def log_response(response):
        if request.path == "/health":
            return response

        request_id = getattr(g, "request_id", None)
        duration = (
            datetime.utcnow() - getattr(request, "_start_time", datetime.utcnow())
        ).total_seconds() * 1000

        log_data = {
            "request_id": request_id,
            "method": request.method,
            "path": request.path,
            "status": response.status_code,
            "duration_ms": round(duration, 2),
            "remote_addr": request.remote_addr,
            "user_agent": request.user_agent.string if request.user_agent else None,
            "content_length": response.content_length,
        }

        # Log request body for POST/PUT/PATCH (except sensitive fields)
        if request.method in ("POST", "PUT", "PATCH") and request.is_json:
            body = request.get_json(silent=True)
            if body:
                log_data["request_body"] = _mask_sensitive(body)

        if response.status_code >= 400:
            app.logger.warning("HTTP Request", extra=log_data)
        else:
            app.logger.info("HTTP Request", extra=log_data)

        if request_id:
            response.headers["X-Request-ID"] = request_id

        return response
