from flask_alembic import Alembic
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_sqlalchemy_lite import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


db = SQLAlchemy()
alembic = Alembic(metadatas=Base.metadata)


def init_alembic(app):
    """Initialize alembic with migrations at backend/migrations/."""
    app.config.setdefault("ALEMBIC", {}).setdefault("script_location", "../migrations")
    alembic.init_app(app)


jwt = JWTManager()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per minute", "50 per second"],
    storage_uri="memory://",
    enabled=True,
)


def init_limiter(app):
    """Initialize limiter with app config."""
    limiter.enabled = app.config.get("RATELIMIT_ENABLED", True)
    limiter.init_app(app)
