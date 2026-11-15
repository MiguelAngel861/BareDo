import json
import logging
import os
from datetime import UTC, datetime
from logging.handlers import RotatingFileHandler

from flask import Flask

from app.core.config import BASE_DIR

# Atributos estándar de LogRecord que no se repiten en el JSON de extra fields.
_RESERVED_FIELDS = frozenset(
    {
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
    }
)


class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        for key, value in record.__dict__.items():
            if key not in _RESERVED_FIELDS:
                log_data[key] = value

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)


def configure_logging(app: Flask):
    """Configure structured JSON logging."""
    if app.config.get("TESTING"):
        return

    log_level = logging.DEBUG if app.debug else logging.INFO
    app.logger.setLevel(log_level)

    # Console handler with JSON formatting
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)

    console_handler.setFormatter(JSONFormatter())
    app.logger.handlers = [console_handler]

    # File handler for production (ruta absoluta para no escribir en cwd arbitrario)
    if not app.debug:
        log_dir = BASE_DIR / "logs"
        os.makedirs(log_dir, exist_ok=True)
        file_handler = RotatingFileHandler(log_dir / "app.log", maxBytes=10485760, backupCount=10)
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(JSONFormatter())
        app.logger.addHandler(file_handler)
