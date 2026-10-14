from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, false, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.extensions import Base

if TYPE_CHECKING:
    from app.models.tasks import Tasks


class Subtasks(Base):
    __tablename__ = "subtasks"

    subtask_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    task_id: Mapped[int] = mapped_column(
        ForeignKey("tasks.task_id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    completed: Mapped[bool] = mapped_column(nullable=False, default=False, server_default=false())
    created_at: Mapped[datetime] = mapped_column(
        nullable=False, default=lambda: datetime.now(UTC), server_default=func.now()
    )

    task: Mapped["Tasks"] = relationship("Tasks", back_populates="subtasks")
