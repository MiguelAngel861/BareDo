from typing import Sequence
from sqlalchemy import select, insert, update, delete

from app.schemas.tasks_schemas import TaskCreate, TaskUpdate
from app.models.tasks import Tasks
from app.extensions import db

class TasksRepository:
    @staticmethod
    def get_all() -> Sequence[Tasks]:
        stmt = select(Tasks)
        result: Sequence[Tasks] = db.session.execute(stmt).scalars().all()
        
        return result
    
    @staticmethod
    def get_by_id(task_id: int) -> Tasks | None:
        return db.session.get(Tasks, task_id)

    @staticmethod
    def add_task(data: TaskCreate) -> Tasks:
        data_dump: dict = data.model_dump()
        
        stmt = insert(Tasks).values(**data_dump).returning(Tasks)
        result: Tasks = db.session.execute(stmt).scalar_one()

        return result
    
    @staticmethod
    def put_update_task(task_id: int, data: TaskUpdate) -> Tasks | None:
        required_fields: list[str] = ['title', 'description', 'completed']
        data_dump: dict = data.model_dump(exclude_unset = True)

        for field in required_fields:
            if field not in data_dump:
                raise ValueError(f"The field '{field}' is required for full update.")
        
        if not db.session.get(Tasks, task_id):
            return None

        stmt = update(Tasks).where(Tasks.task_id == task_id).values(**data_dump).returning(Tasks)
        result = db.session.execute(stmt).scalar_one()

        return result
    
    @staticmethod
    def patch_update_task(task_id: int, data: TaskUpdate) -> Tasks | None:
        if not data.has_changes():
            raise ValueError("No fields provided for update.")
        
        data_dump: dict = data.model_dump(exclude_unset = True)
        
        if not db.session.get(Tasks, task_id):
            return None
        
        stmt = update(Tasks).where(Tasks.task_id == task_id).values(**data_dump).returning(Tasks)
        result = db.session.execute(stmt).scalar_one()

        return result
    
    @staticmethod
    def delete_task(task_id: int):
        strmt = delete(Tasks).where(Tasks.task_id == task_id)
        db.session.execute(strmt)