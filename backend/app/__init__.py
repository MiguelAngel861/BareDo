import os

from flask import Flask

from app.api.v1.routes.auth import auth_bp
from app.api.v1.routes.health import health_bp
from app.api.v1.routes.tasks import tasks_bp
from app.core.config import config
from app.core.cors import setup_cors
from app.core.extensions import db, init_alembic, init_limiter, jwt
from app.core.logging import configure_logging
from app.core.middleware import register_middleware
from app.errors.handlers import register_error_handlers, register_jwt_handlers


def create_app(config_name: str | None = None) -> Flask:
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "default")

    app: Flask = Flask(__name__)

    app.config.from_object(config[config_name])

    # Configure logging
    configure_logging(app)

    # CORS
    setup_cors(app)

    # Extensions from app.core
    register_error_handlers(app)
    db.init_app(app)
    init_alembic(app)
    jwt.init_app(app)
    register_jwt_handlers(app.extensions["flask-jwt-extended"])
    init_limiter(app)

    # Security headers + request/response logging middleware
    register_middleware(app)

    app.register_blueprint(tasks_bp, url_prefix="/api/v1")
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(health_bp)

    return app
