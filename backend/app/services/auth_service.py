from flask_jwt_extended import get_jwt_identity
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.errors.exceptions import DatabaseError, DataValidationError
from app.core.extensions import db
from app.models.users import Users


class AuthService:
    def register(self, username: str, password: str) -> Users:
        with db.session as session:
            try:
                user = Users(username=username)
                user.set_password(password)
                session.add(user)
                session.commit()
                # Access user_id to avoid detached instance issue
                _ = user.user_id
                return user
            except IntegrityError:
                session.rollback()
                raise DataValidationError("Username already exists")
            except SQLAlchemyError as e:
                session.rollback()
                raise DatabaseError(str(e))

    def login(self, username: str, password: str) -> Users | None:
        stmt = select(Users).where(Users.username == username)
        user = db.session.execute(stmt).scalar_one_or_none()
        if user and user.check_password(password):
            _ = user.user_id  # Access to avoid detached instance
            return user
        return None

    def get_current_user(self) -> Users | None:
        user_id = get_jwt_identity()
        return self.get_user_by_id(user_id) if user_id else None

    def get_user_by_id(self, user_id) -> Users | None:
        stmt = select(Users).where(Users.user_id == int(user_id))
        user = db.session.execute(stmt).scalar_one_or_none()
        if user:
            _ = user.user_id
        return user
