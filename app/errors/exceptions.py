class DomainError(Exception):
    """Base Class for Errors"""

    pass


class DataValidationError(DomainError):
    """Data Validation Errors"""

    pass


class NotFoundError(DomainError):
    """Resource Not Found Errors"""

    pass


class DatabaseError(DomainError):
    """Generic Database and SQLAlchemy related errors"""

    pass
