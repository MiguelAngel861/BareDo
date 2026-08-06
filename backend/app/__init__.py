import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

from app.core.extensions import db, alembic, jwt, limiter
from app.core.config import config
from app.api.v1.routes.tasks import tasks_bp
from app.api.v1.routes.auth import auth_bp
from app.api.v1.routes.main import main_bp
from app.errors.handlers import register_error_handlers, register_jwt_handlers


def create_app(config_name: str | None = None) -> Flask:
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "default")

    frontend_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "src"
    )
    app: Flask = Flask(
        __name__, template_folder=frontend_path, static_folder=frontend_path, static_url_path=""
    )

    app.config.from_object(config[config_name])

    # Configure logging
    configure_logging(app)

    # CORS - explicit for same-origin frontend
    CORS(
        app,
        origins=[
            "http://localhost:5000",
            "http://127.0.0.1:5000",
            "http://localhost:5500",
            "http://127.0.0.1:5500",
        ],
        supports_credentials=True,
    )

    # Extensions from app.core
    register_error_handlers(app)
    db.init_app(app)
    alembic.init_app(app)
    jwt.init_app(app)
    register_jwt_handlers(app.extensions["flask-jwt-extended"])
    limiter.init_app(app)

    # Security headers middleware
    @app.after_request
    def add_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        if request.is_secure:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

    # Request logging
    @app.before_request
    def log_request():
        request._start_time = datetime.utcnow()

    @app.after_request
    def log_response(response):
        if request.path == "/health":
            return response

        duration = (
            datetime.utcnow() - getattr(request, "_start_time", datetime.utcnow())
        ).total_seconds() * 1000

        log_data = {
            "method": request.method,
            "path": request.path,
            "status": response.status_code,
            "duration_ms": round(duration, 2),
            "remote_addr": request.remote_addr,
            "user_agent": request.user_agent.string if request.user_agent else None,
            "content_length": response.content_length,
        }

        # Log request body for POST/PUT/PATCH (except passwords)
        if request.method in ("POST", "PUT", "PATCH") and request.is_json:
            body = request.get_json(silent=True)
            if body:
                safe_body = {k: v if k != "password" else "***" for k, v in body.items()}
                log_data["request_body"] = safe_body

        if response.status_code >= 400:
            app.logger.warning("HTTP Request", extra=log_data)
        else:
            app.logger.info("HTTP Request", extra=log_data)

        return response

    app.register_blueprint(tasks_bp, url_prefix="/api/v1")
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(main_bp, url_prefix="/")

    # Health check endpoint
    @app.get("/health")
    def health_check():
        return jsonify({"status": "healthy", "service": "bare-do-api"}), 200

    return app


def configure_logging(app: Flask):
    """Configure structured JSON logging."""
    if app.config.get("TESTING"):
        return

    log_level = logging.DEBUG if app.debug else logging.INFO
    app.logger.setLevel(log_level)

    # Console handler with JSON formatting
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)

    class JSONFormatter(logging.Formatter):
        def format(self, record):
            import json

            log_data = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "level": record.levelname,
                "logger": record.name,
                "message": record.getMessage(),
                "module": record.module,
                "function": record.funcName,
                "line": record.lineno,
            }

            # Add extra fields if present
            for key, value in record.__dict__.items():
                if key not in [
                    "name",
                    "msg",
                    "args",
                    "created",
                    "filename",
                    "funcName",
                    "levelname",
                    "levelno",
                    "lineno",
                    "module",
                    "msecs",
                    "message",
                    "msg",
                    "name",
                    "pathname",
                    "process",
                    "processName",
                    "relativeCreated",
                    "thread",
                    "threadName",
                    "exc_info",
                    "exc_text",
                    "stack_info",
                    "getMessage",
                ]:
                    log_data[key] = value

            if record.exc_info:
                log_data["exception"] = self.formatException(record.exc_info)

            return json.dumps(log_data)

    console_handler.setFormatter(JSONFormatter())
    app.logger.handlers = [console_handler]

    # File handler for production
    if not app.debug:
        os.makedirs("logs", exist_ok=True)
        file_handler = RotatingFileHandler("logs/app.log", maxBytes=10485760, backupCount=10)
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(JSONFormatter())
        app.logger.addHandler(file_handler)
