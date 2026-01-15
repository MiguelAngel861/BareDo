from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, func, false
from app.extensions import Base

class Tasks(Base):
    __tablename__ = "tasks"
    
    task_id: Mapped[int] = mapped_column(primary_key = True, autoincrement = True)
    title: Mapped[str] = mapped_column(String(40), nullable = False)
    description: Mapped[str] = mapped_column(String(500), nullable = True)
    completed: Mapped[bool] = mapped_column(nullable = False, default = False, server_default = false())
    created_at: Mapped[datetime] = mapped_column(nullable = False, default = datetime.now, server_default = func.current_timestamp())
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    