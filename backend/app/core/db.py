from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.extensions import db
from app.errors.exceptions import DatabaseError, DataValidationError


@contextmanager
def transactional(session: Session | None = None) -> Iterator[Session]:
    session = session or db.session
    try:
        yield session
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise DataValidationError(str(exc)) from exc
    except SQLAlchemyError as exc:
        session.rollback()
        raise DatabaseError(str(exc)) from exc
    except BaseException:
        session.rollback()
        raise
