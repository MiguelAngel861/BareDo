from flask_jwt_extended import create_access_token, get_jwt_identity
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.errors.exceptions import DatabaseError, DataValidationError
from app.extensions import db
from app.models.users import Users


class AuthService:
    def register(self, username: str, password: str) -> dict:
        with db.session as session:
            try:
                user = Users(username=username)
                user.set_password(password)
                session.add(user)
                session.commit()
                return user.to_dict()
            except IntegrityError as e:
                session.rollback()
                raise DataValidationError("Username already exists")
            except SQLAlchemyError as e:
                session.rollback()
                raise DatabaseError(str(e))

    def login(self, username: str, password: str) -> dict | None:
        stmt = select(Users).where(Users.username == username)
        user = db.session.execute(stmt).scalar_one_or_none()
        if user and user.check_password(password):
            return user.to_dict()
        return None

    def get_current_user(self) -> dict | None:
        user_id = get_jwt_identity()
        if not user_id:
            return None
        stmt = select(Users).where(Users.user_id == int(user_id))
        user = db.session.execute(stmt).scalar_one_or_none()
        return user.to_dict() if user else None

    @staticmethod
    def create_token(user_id: int) -> str:
        return create_access_token(identity=str(user_id))