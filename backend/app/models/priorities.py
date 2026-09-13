from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.extensions import Base


class Priorities(Base):
    __tablename__ = "priorities"

    priority_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    level: Mapped[int] = mapped_column(nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(String(100), nullable=True)
