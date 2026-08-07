import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SQLITE_PATH = BASE_DIR / "instance" / "db.sqlite"


def _default_db_url() -> str:
    """Lazy default DB URL - only creates instance/ dir when called, not at import time."""
    sqlite_dir = SQLITE_PATH.parent
    sqlite_dir.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{SQLITE_PATH.as_posix()}"


def _db_url_from_env() -> str | None:
    """DATABASE_URL from env, normalizing scheme for SQLAlchemy 2 + psycopg3.

    Accepts postgres:// (Render legacy) and postgresql://, forcing the
    psycopg3 driver dialect.
    """
    url = os.environ.get("DATABASE_URL")
    if not url:
        return None
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://") :]
    if url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url[len("postgresql://") :]
    return url


def _cors_origins_from_env() -> list[str]:
    raw = os.environ.get("CORS_ORIGINS", "")
    if not raw:
        return [
            "http://localhost:5000",
            "http://127.0.0.1:5000",
            "http://localhost:5500",
            "http://127.0.0.1:5500",
        ]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-in-production")
    DATABASE_URL = _db_url_from_env()
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or _default_db_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }
    SQLALCHEMY_ENGINES = {"default": DATABASE_URL or _default_db_url()}
    CORS_ORIGINS = _cors_origins_from_env()
    MAX_CONTENT_LENGTH = 1024 * 1024
    RATELIMIT_ENABLED = True


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = False


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ECHO = False

    def __init__(self):
        super().__init__()
        if self.SECRET_KEY == "dev-secret-change-in-production":
            raise RuntimeError("SECRET_KEY must be set in production")
        if self.JWT_SECRET_KEY == "dev-jwt-secret-change-in-production":
            raise RuntimeError("JWT_SECRET_KEY must be set in production")


class TestingConfig(Config):
    DEBUG = False
    TESTING = True
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_ENGINES = {"default": "sqlite:///:memory:"}
    RATELIMIT_ENABLED = False


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
