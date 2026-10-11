from datetime import UTC, date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, false, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.extensions import Base

if TYPE_CHECKING:
    from app.models.tags import Tags


class Tasks(Base):
    __tablename__ = "tasks"

    task_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    title: Mapped[str] = mapped_column(String(40), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    priority_id: Mapped[int] = mapped_column(
        ForeignKey("priorities.priority_id"), nullable=False, default=3, server_default="3"
    )
    due_date: Mapped[datetime] = mapped_column(
        nullable=False, default=date.today, server_default=func.current_date()
    )
    completed: Mapped[bool] = mapped_column(nullable=False, default=False, server_default=false())

    created_at: Mapped[datetime] = mapped_column(
        nullable=False, default=lambda: datetime.now(UTC), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        server_default=func.now(),
        server_onupdate=func.now(),
    )

    tags: Mapped[list["Tags"]] = relationship(
        "Tags",
        secondary="task_tags",
        back_populates="tasks",
        lazy="selectin",
    )
