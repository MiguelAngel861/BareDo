import json
import logging
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler

from flask import Flask


class JSONFormatter(logging.Formatter):
    def format(self, record):
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

    # File handler for production
    if not app.debug:
        os.makedirs("logs", exist_ok=True)
        file_handler = RotatingFileHandler("logs/app.log", maxBytes=10485760, backupCount=10)
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(JSONFormatter())
        app.logger.addHandler(file_handler)
