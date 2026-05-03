from flask import Blueprint, abort, request
from pydantic import ValidationError

from app.api.v1.schemas.tasks_schemas import (
    TaskCreate,
    TaskPatch,
    TaskResponse,
    TaskUpdate,
    TaskBody,
    PaginationResponse
)
from app.api.v1.services.tasks_service import TasksService
from app.errors.exceptions import DataValidationError, NotFoundError

tasks_bp = Blueprint("tasks", __name__)
service = TasksService()


@tasks_bp.get("/tasks")
def get_tasks():
    # URL Arguments
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=100, type=int)
    sort = request.args.get("sort")
    filters = {
        "title": request.args.get("title"),
        "description": request.args.get("description"),
        "completed": request.args.get("completed", type=lambda v: v.lower() == "true"),
    }

    stmt = service.get_all_tasks(page, per_page, filters, sort)["tasks"]
    validated_tasks = [TaskBody.model_validate(task) for task in stmt]

    meta = PaginationResponse(
        total=len(validated_tasks),
        page=page,
        per_page=per_page,
        total_pages=(len(validated_tasks) + per_page - 1) // per_page
        )
    
    validated_data = TaskResponse(tasks = validated_tasks, meta=meta)
    
    return TaskResponse.model_validate(validated_data).model_dump(), 201


@tasks_bp.get("/tasks/<int:task_id>")
def get_task_by_id(task_id: int):
    try:
        stmt = service.get_task_by_id(task_id)
        return TaskBody.model_validate(stmt).model_dump(), 200

    except NotFoundError:
        abort(404)


@tasks_bp.post("/tasks")
def add_task():
    request.max_content_length = 1024 * 1024
    task_data = TaskCreate(**request.get_json())

    new_task = service.add_new_task(task_data.model_dump())

    return TaskBody.model_validate(new_task).model_dump(), 201


@tasks_bp.put("/tasks/<int:task_id>")
def update_task(task_id: int) -> dict:
    request.max_content_length = 1024 * 1024

    try:
        task_data = TaskUpdate(**request.get_json())
        updated_task = service.update_task(task_id, task_data.model_dump())

        return TaskBody.model_validate(updated_task).model_dump()

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

        return TaskBody.model_validate(patched_task).model_dump()

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
