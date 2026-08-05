import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-in-production")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///db.sqlite"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }
    SQLALCHEMY_ENGINES = {
        "default": os.environ.get("DATABASE_URL", "sqlite:///db.sqlite")
    }


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = False


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ECHO = False


class TestingConfig(Config):
    DEBUG = False
    TESTING = True
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_ENGINES = {"default": "sqlite:///:memory:"}


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}