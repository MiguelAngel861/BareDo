from typing import Sequence

from app.schemas.tasks_schemas import TaskUpdate, TaskCreate, TaskResponse
from app.repositories.tasks_repository import TasksRepository
from app.models.tasks import Tasks
from app.extensions import db

class TasksService:
    def __init__(self) -> None:
        self.repository = TasksRepository()
        
    def get_all_tasks(self) -> list[TaskResponse]:
        stmt: Sequence[Tasks] = self.repository.get_all()
        result: list[TaskResponse] = [TaskResponse.model_validate(task) for task in stmt]

        return result
    
    def get_task_by_id(self, task_id: int) -> TaskResponse | None:
        stmt: Tasks | None = self.repository.get_by_id(task_id)
        
        if stmt is None:
            return None
        return TaskResponse.model_validate(stmt)
    
    def add_new_task(self, task_data: TaskCreate) -> TaskResponse:
        new_task: Tasks = self.repository.add_task(task_data)
        db.session.commit()
        
        return TaskResponse.model_validate(new_task)
    
    # Actualizacion completa del Objeto (PUT)
    def update_task_put(self, task_id: int, task_data: TaskUpdate) -> TaskResponse | None:
        data_dump: dict = task_data.model_dump(exclude_unset = True)
        required_fields: list[str] = ['title', 'description', 'completed']
        
        for field in required_fields:
            if field not in data_dump:
                raise ValueError(f"The field '{field}' is required for full update.")

        updated_task: Tasks | None = self.repository.put_update_task(task_id, task_data)
        db.session.commit()
        
        if updated_task is None:
            return None
        
        return TaskResponse.model_validate(updated_task)

    def update_task_patch(self, task_id: int, task_data: TaskUpdate) -> TaskResponse | None:
        if not task_data.has_changes():
            raise ValueError("No fields provided for update.")
        
        updated_task: Tasks | None = self.repository.patch_update_task(task_id, task_data)
        db.session.commit()
        
        if updated_task is None:
            return None
        return TaskResponse.model_validate(updated_task)
    
    def delete_task(self, task_id: int) -> None:
        self.repository.delete_task(task_id)
        db.session.commit()