from typing import Sequence
from sqlalchemy import select, insert, update

from app.models.tasks import Tasks
from app.extensions import db

class TasksRepository:
    @staticmethod
    def get_all() -> Sequence[Tasks]:
        stmt = select(Tasks)
        result = db.session.execute(stmt).scalars().all()
        
        return result
    
    @staticmethod
    def get_task_by_id(task_id: int) -> Tasks | None:
        return db.session.get(Tasks, task_id)
    
    @staticmethod
    def add_task(data: dict) -> Tasks:
        stmt = insert(Tasks).values(**data).returning(Tasks)
        result = db.session.execute(stmt).scalar_one()
        db.session.flush()

        return result
    
    @staticmethod
    def put_update_task(task_id: int, data: dict) -> Tasks | None:
        stmt = update(Tasks).where(Tasks.task_id == task_id).values(**data).returning(Tasks)
        result = db.session.execute(stmt).scalar_one()
        db.session.flush()
        
        return result
    
    @staticmethod
    def patch_update_task(task_id: int, data: dict) -> Tasks | None:
        if not data:
            raise ValueError("At least one field is required for partial update.")

        stmt = update(Tasks).where(Tasks.task_id == task_id).values(**data).returning(Tasks)
        result = db.session.execute(stmt).scalar_one()
        db.session.flush()
        
        return result