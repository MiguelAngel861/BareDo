from typing import Any

from flask import Blueprint, abort, request

from app.schemas.tasks_schemas import TaskCreate, TaskUpdate
from app.services.tasks_service import TasksService

tasks_bp = Blueprint("tasks", __name__)
service = TasksService()


@tasks_bp.get("/tasks")
def get_tasks():
    result = service.get_all_tasks()
    tasks = [task.model_dump() for task in result]

    return tasks, 200


@tasks_bp.get("/tasks/<int:task_id>")
def get_task_by_id(task_id: int):
    stmt = service.get_task_by_id(task_id)
    if not stmt:
        abort(404, description="Task not found")

    return stmt.model_dump(), 200


@tasks_bp.post("/tasks")
def add_task():
    request.max_content_length = 1024 * 1024

    try:
        task_data = TaskCreate(**request.get_json())

    except Exception as e:
        return {"error": str(e)}, 400

    try:
        new_task = service.add_new_task(task_data)
        return new_task.model_dump(), 201

    except Exception as e:
        return {"error": str(e)}, 500


@tasks_bp.put("/tasks/<int:task_id>")
def update_task_put(task_id: int):
    request.max_content_length = 1024 * 1024

    try:
        task_data = TaskUpdate(**request.get_json())

    except Exception as e:
        return {"error": str(e)}, 400

    try:
        updated_task = service.update_task_put(task_id, task_data)

        if updated_task is None:
            abort(404, description="Task not found")

        return updated_task.model_dump(), 200

    except ValueError as ve:
        return {"error": str(ve)}, 400

    except Exception as e:
        return {"error": str(e)}, 500


@tasks_bp.patch("/tasks/<int:task_id>")
def update_task_patch(task_id: int):
    request.max_content_length = 1024 * 1024

    try:
        task_data = TaskUpdate(**request.get_json())

    except Exception as e:
        return {"error": str(e)}, 400

    try:
        updated_task = service.update_task_patch(task_id, task_data)

        if updated_task is None:
            abort(404, description="Task not found")

        return updated_task.model_dump(), 200

    except ValueError as ve:
        return {"error": str(ve)}, 400

    except Exception as e:
        return {"error": str(e)}, 500


@tasks_bp.delete("/tasks/<int:task_id>")
def delete_task(task_id: int) -> Any:
    deleted_task = service.delete_task(task_id)  # noqa: F841
    
    return {}, 204