from flask import Blueprint, abort, request

from app.api.v1.schemas.tasks_schemas import (
    TaskCreate,
    TaskPatch,
    TaskUpdate,
    TaskBody,
    TaskResponse,
    PaginationResponse,
)
from app.api.v1.services.tasks_service import TasksService

tasks_bp = Blueprint("tasks", __name__)
service = TasksService()


@tasks_bp.get("/tasks")
def get_tasks():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=100, type=int)
    sort = request.args.get("sort")
    filters = {
        "title": request.args.get("title"),
        "description": request.args.get("description"),
        "completed": request.args.get("completed", type=lambda v: v.lower() == "true"),
    }

    if page < 1:
        abort(400, "page must be >= 1")

    if per_page < 1 or per_page > 100:
        abort(400, "per_page must be between 1 and 100")

    if filters["completed"] is not None and filters["completed"] not in (True, False):
        abort(400, "completed must be 'true' or 'false'")

    result = service.get_all_tasks(page, per_page, filters, sort)
    tasks = result.get("tasks", [])
    meta_data = result.get("meta", {})

    validated_tasks = [TaskBody.model_validate(task) for task in tasks]
    meta = PaginationResponse(**meta_data)

    return TaskResponse(tasks=validated_tasks, meta=meta).model_dump(), 200


@tasks_bp.get("/tasks/<int:task_id>")
def get_task_by_id(task_id: int):
    stmt = service.get_task_by_id(task_id)
    return TaskBody.model_validate(stmt).model_dump(), 200


@tasks_bp.post("/tasks")
def add_task():
    request.max_content_length = 1024 * 1024
    payload = request.get_json(silent=True) or {}
    task_data = TaskCreate(**payload)

    new_task = service.add_new_task(task_data.model_dump())

    return TaskBody.model_validate(new_task).model_dump(), 201


@tasks_bp.put("/tasks/<int:task_id>")
def update_task(task_id: int):
    request.max_content_length = 1024 * 1024
    payload = request.get_json(silent=True) or {}
    task_data = TaskUpdate(**payload)

    updated_task = service.update_task(task_id, task_data.model_dump())

    return TaskBody.model_validate(updated_task).model_dump()


@tasks_bp.patch("/tasks/<int:task_id>")
def patch_task(task_id: int):
    request.max_content_length = 1024 * 1024
    payload = request.get_json(silent=True) or {}
    task_data = TaskPatch(**payload)

    patched_task = service.update_task(
        task_id, task_data.model_dump(exclude_unset=True)
    )

    return TaskBody.model_validate(patched_task).model_dump()


@tasks_bp.delete("/tasks/<int:task_id>")
def delete_task(task_id: int):
    service.delete_task(task_id)
    return {}, 204
