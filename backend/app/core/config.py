import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SQLITE_PATH = BASE_DIR / "instance" / "db.sqlite"


def _default_db_url() -> str:
    """Lazy default DB URL - only creates instance/ dir when called, not at import time."""
    sqlite_dir = SQLITE_PATH.parent
    sqlite_dir.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{SQLITE_PATH.as_posix()}"


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-in-production")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or _default_db_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }
    SQLALCHEMY_ENGINES = {"default": os.environ.get("DATABASE_URL") or _default_db_url()}
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
