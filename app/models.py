from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from datetime import datetime

class Base(DeclarativeBase):
    pass

class Tareas(Base):
    __tablename__ = "tareas"
    
    id_tareas: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    titulo: Mapped[str] = mapped_column(nullable=False)
    descripcion: Mapped[str] = mapped_column(nullable=True)
    realizada: Mapped[bool] = mapped_column(nullable=False, default=False)
    fecha_creacion: Mapped[datetime] = mapped_column(nullable=False, default=datetime.now)
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    