from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.extensions import db
from app.errors.exceptions import ConflictError, DatabaseError, DataValidationError


def _is_unique_violation(exc: IntegrityError) -> bool:
    # Postgres: sqlstate 23505 = unique. Fallback por texto para otros dialectos.
    if getattr(getattr(exc, "orig", None), "sqlstate", None) == "23505":
        return True
    text = str(getattr(exc, "orig", None) or exc).lower()
    return "unique" in text or "duplicate" in text


@contextmanager
def transactional() -> Iterator[Session]:
    session = db.session
    try:
        yield session
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        if _is_unique_violation(exc):
            raise ConflictError("Resource already exists") from exc
        raise DataValidationError("Invalid data") from exc
    except SQLAlchemyError as exc:
        session.rollback()
        raise DatabaseError("Database operation failed") from exc
    except BaseException:
        session.rollback()
        raise
