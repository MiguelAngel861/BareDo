import mimetypes
import os

from flask_openapi4 import Info, OpenAPI
from pydantic import BaseModel

from app.api.v1.routes.auth import auth_bp
from app.api.v1.routes.health import health_bp
from app.api.v1.routes.priorities import priorities_bp
from app.api.v1.routes.tasks import tasks_bp
from app.core.config import SQLITE_PATH, config
from app.core.cors import setup_cors
from app.core.extensions import db, init_alembic, init_limiter, jwt
from app.core.logging import configure_logging
from app.core.middleware import register_middleware
from app.errors.handlers import (
    openapi_validation_error_callback,
    register_error_handlers,
    register_jwt_handlers,
)


class BareDoApp(OpenAPI):
    """OpenAPI subclass that automatically serializes Pydantic models in responses."""

    def make_response(self, rv):
        if isinstance(rv, tuple) and len(rv) > 0 and isinstance(rv[0], BaseModel):
            rv = (rv[0].model_dump(mode="json"), *rv[1:])
        elif isinstance(rv, BaseModel):
            rv = rv.model_dump(mode="json")
        return super().make_response(rv)


def create_app(config_name: str | None = None) -> BareDoApp:
    # Ensure Windows registry doesn't cause text/plain MIME types for JS/CSS assets
    mimetypes.add_type("application/javascript", ".js")
    mimetypes.add_type("text/css", ".css")

    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "default")

    info = Info(title="BareDo API", version="1.3.0", description="Backend de BareDo")
    app: BareDoApp = BareDoApp(
        __name__,
        info=info,
        validation_error_callback=openapi_validation_error_callback,
    )

    app.config.from_object(config[config_name])

    # Ensure the instance folder exists (sqlite default DB lives there)
    os.makedirs(SQLITE_PATH.parent, exist_ok=True)

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

    # Register blueprints
    app.register_api(tasks_bp)
    app.register_api(priorities_bp)
    app.register_api(auth_bp)
    app.register_api(health_bp)

    return app
