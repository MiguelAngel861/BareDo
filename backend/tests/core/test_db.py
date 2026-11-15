import pytest

from app.core.db import transactional
from app.errors.exceptions import ConflictError, DataValidationError
from app.models.tasks import Tasks
from app.models.users import Users


def test_unique_violation_maps_to_conflict(app):
    with app.app_context():
        with transactional() as session:
            session.add(Users(username="uq_map", password_hash="h"))

        with pytest.raises(ConflictError):
            with transactional() as session:
                session.add(Users(username="uq_map", password_hash="h"))


def test_other_integrity_error_maps_to_validation(app):
    with app.app_context():
        # FK a priorities con un id inexistente: IntegrityError, no duplicado.
        with pytest.raises(DataValidationError):
            with transactional() as session:
                session.add(Tasks(user_id=1, title="titulo", priority_id=99999))
