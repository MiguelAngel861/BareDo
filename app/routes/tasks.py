from typing import Any

from flask import request, abort
from flask import Blueprint

from app.services.tasks_service import TasksService
from app.models.tasks import Tasks

tasks_bp = Blueprint("tasks", __name__)
service = TasksService()

@tasks_bp.get("/tasks")
def get_tasks():
    result = service.get_all_tasks()
    tasks =  [task.model_dump() for task in result]
    
    return tasks, 200

@tasks_bp.get("/tasks/<int:task_id>")
def get_task_by_id(task_id: int):
    stmt = service.get_task_by_id(task_id)
    if not stmt:
        abort(404, description = "Task not found")

    return stmt.model_dump(), 200

@tasks_bp.post("/tasks")
def add_task() -> Any:
    request.max_content_length = (1024 * 1024)


'''
@tareas_bp.put("/tasks/<int:task_id>")
def editar_tarea(task_id: int) -> Any:
    request.max_content_length = (1024 * 1024)
    
    tarea = db.session.execute(select(Tasks).where(Tasks.task_id == task_id)).scalar_one()
    if not tarea:
        abort(404, description = "Task not found")

    if not request.is_json:
        abort(400, description = "Request must be a JSON")
    
    data = request.json

    campos_permitidos = ["titulo", "descripcion", "realizada"]
    
    for key, value in data.items():
        if key in campos_permitidos:
            setattr(tarea, key, value)
    
    db.session.commit()
    
    task_id_data = tarea.to_dict()
    return task_id_data, 200

@tareas_bp.delete("/tasks/<int:task_id>")
def eliminar_tarea(task_id: int) -> Any:
    query = delete(Tasks).where(Tasks.task_id == task_id)
    result = db.session.execute(query)
    db.session.commit()
    
    if result.rowcount == 0: # type: ignore
        abort(404, description = "Task not found")
        
    return "", 200
'''