from typing import Any

from sqlalchemy import select, insert, delete
from flask import request, abort
from flask import Blueprint


from app.extensions import db
from app.models import Tareas

tareas_bp = Blueprint("tareas", __name__)

@tareas_bp.get("/tasks")
def get_tareas() -> Any:
    query = select(Tareas)
    result = db.session.execute(query).scalars().all()
    return [tarea.to_dict() for tarea in result], 200

@tareas_bp.post("/tasks")
def anadir_tarea() -> Any:
    request.max_content_length = (1024 * 1024)
    if not request.is_json:
        abort(400, description = "Request must be a JSON")
    
    data = request.json
    if not data.get("titulo") or not data.get("descripcion"):
        abort(400, description = "Missing required fields: 'titulo' and 'descripcion'")

    query = insert(Tareas).values(titulo = data["titulo"], descripcion = data["descripcion"]).returning(Tareas)
    result = db.session.execute(query)
    
    new_task = result.scalar_one()
    task_data = new_task.to_dict()
    
    db.session.commit()
    
    return task_data, 201

@tareas_bp.put("/tasks/<int:task_id>")
def editar_tarea(task_id: int) -> Any:
    request.max_content_length = (1024 * 1024)
    
    tarea = db.session.execute(select(Tareas).where(Tareas.id_tareas == task_id)).scalar_one()
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
    query = delete(Tareas).where(Tareas.id_tareas == task_id)
    result = db.session.execute(query)
    db.session.commit()
    
    if result.rowcount == 0: # type: ignore
        abort(404, description = "Task not found")
        
    return "", 200