from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from flask import Flask, g, request
from werkzeug.middleware.proxy_fix import ProxyFix

SENSITIVE_FIELDS = {
    "password",
    "passwd",
    "pwd",
    "user_password",
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


def _truncate(value: Any, max_len: int) -> Any:
    """Trunca strings largos para no llenar los logs con cuerpos enormes."""
    if isinstance(value, str):
        return value[:max_len] + ("…" if len(value) > max_len else "")
    if isinstance(value, dict):
        return {k: _truncate(v, max_len) for k, v in value.items()}
    if isinstance(value, list):
        return [_truncate(item, max_len) for item in value]
    return value


def register_middleware(app: Flask):
    """Register security headers and request/response logging middleware."""
    # Confiar en X-Forwarded-For (1 nivel de proxy: nginx/Render) para que
    # flask-limiter cuente la IP real del cliente y no la del proxy.
    # shortcut: solo es seguro si TODO acceso pasa por el proxy de confianza;
    # si alguien puede llegar directo al puerto de gunicorn, puede forjar IPs.
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1)

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
        request._start_time = datetime.now(UTC)

    @app.after_request
    def log_response(response):
        if request.path in ("/health", "/api/v1/health"):
            return response

        request_id = getattr(g, "request_id", None)
        start_time = getattr(request, "_start_time", None) or datetime.now(UTC)
        duration = (datetime.now(UTC) - start_time).total_seconds() * 1000

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

        # Log request body for POST/PUT/PATCH (except sensitive fields, truncated)
        if request.method in ("POST", "PUT", "PATCH") and request.is_json:
            body = request.get_json(silent=True)
            if body:
                masked = _mask_sensitive(body)
                log_data["request_body"] = _truncate(masked, 1024)

        if response.status_code >= 400:
            app.logger.warning("HTTP Request", extra=log_data)
        else:
            app.logger.info("HTTP Request", extra=log_data)

        if request_id:
            response.headers["X-Request-ID"] = request_id

        return response
