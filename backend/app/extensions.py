from flask_sqlalchemy_lite import SQLAlchemy
from flask_alembic import Alembic
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


db = SQLAlchemy()
alembic = Alembic(metadatas=Base.metadata)
