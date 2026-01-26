from flask import Blueprint, abort, request
from pydantic import ValidationError

from app.api.v1.schemas.tasks_schemas import (
    TaskCreate,
    TaskPatch,
    TaskResponse,
    TaskUpdate,
)
from app.api.v1.services.tasks_service import TasksService
from app.errors.exceptions import NotFoundError, DataValidationError
tasks_bp = Blueprint("tasks", __name__)
service = TasksService()


@tasks_bp.get("/tasks")
def get_tasks() -> tuple:
    stmt: list[dict] = service.get_all_tasks()
    return [TaskResponse.model_validate(task).model_dump() for task in stmt], 200


@tasks_bp.get("/tasks/<int:task_id>")
def get_task_by_id(task_id: int):
    try:
        stmt = service.get_task_by_id(task_id)
        return TaskResponse.model_validate(stmt).model_dump(), 200
    
    except NotFoundError:
        abort(404)
    


@tasks_bp.post("/tasks")
def add_task():
    request.max_content_length = 1024 * 1024
    task_data = TaskCreate(**request.get_json())

    new_task = service.add_new_task(task_data.model_dump())

    return TaskResponse.model_validate(new_task).model_dump(), 201


@tasks_bp.put("/tasks/<int:task_id>")
def update_task(task_id: int) -> dict:
    request.max_content_length = 1024 * 1024
    
    try:
        task_data = TaskUpdate(**request.get_json())
        updated_task = service.update_task(task_id, task_data.model_dump())

        return TaskResponse.model_validate(updated_task).model_dump()

    except ValidationError or DataValidationError:
        abort(400)

    except NotFoundError:
        abort(404)
    
    

@tasks_bp.patch("/tasks/<int:task_id>")
def patch_task(task_id: int):
    request.max_content_length = 1024 * 1024
    try:
        task_data = TaskPatch(**request.get_json())
        patched_task = service.update_task(task_id, task_data.model_dump())

        return TaskResponse.model_validate(patched_task).model_dump()

    except ValidationError or DataValidationError:
        abort(400)

    except NotFoundError:
        abort(404)

@tasks_bp.delete("/tasks/<int:task_id>")
def delete_task(task_id: int):
    try:
        service.delete_task(task_id)

        return {}, 204

    except NotFoundError:
        abort(404)