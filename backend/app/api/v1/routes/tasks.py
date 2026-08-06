from flask import Blueprint, abort, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from pydantic import ValidationError

from app.api.v1.schemas.tasks_schemas import (
    TaskCreate,
    TaskPatch,
    TaskUpdate,
    TaskBody,
    TaskResponse,
    PaginationResponse,
    TaskListQuery,
)
from app.services.tasks_service import TasksService

tasks_bp = Blueprint("tasks", __name__)
service = TasksService()


@tasks_bp.get("/tasks")
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    if not user_id:
        abort(401, "Invalid token")
    user_id = int(user_id)

    try:
        query = TaskListQuery(**request.args)
    except ValidationError as e:
        abort(400, str(e))

    filters = {
        "title": query.title,
        "description": query.description,
        "completed": query.completed,
    }

    result = service.get_all_tasks(query.page, query.per_page, filters, query.sort, user_id)
    tasks = result.get("tasks", [])
    meta_data = result.get("meta", {})

    validated_tasks = [TaskBody.model_validate(task) for task in tasks]
    meta = PaginationResponse(**meta_data)

    return TaskResponse(tasks=validated_tasks, meta=meta).model_dump(), 200


@tasks_bp.get("/tasks/<int:task_id>")
@jwt_required()
def get_task_by_id(task_id: int):
    user_id = get_jwt_identity()
    if not user_id:
        abort(401, "Invalid token")
    user_id = int(user_id)

    stmt = service.get_task_by_id(task_id, user_id)
    return TaskBody.model_validate(stmt).model_dump(), 200


@tasks_bp.post("/tasks")
@jwt_required()
def add_task():
    user_id = get_jwt_identity()
    if not user_id:
        abort(401, "Invalid token")
    user_id = int(user_id)

    request.max_content_length = 1024 * 1024
    payload = request.get_json(silent=True) or {}
    try:
        task_data = TaskCreate(**payload)
    except ValidationError as e:
        abort(400, str(e))

    new_task = service.add_new_task(task_data.model_dump(), user_id)

    return TaskBody.model_validate(new_task).model_dump(), 201


@tasks_bp.put("/tasks/<int:task_id>")
@jwt_required()
def update_task(task_id: int):
    user_id = get_jwt_identity()
    if not user_id:
        abort(401, "Invalid token")
    user_id = int(user_id)

    request.max_content_length = 1024 * 1024
    payload = request.get_json(silent=True) or {}
    try:
        task_data = TaskUpdate(**payload)
    except ValidationError as e:
        abort(400, str(e))

    updated_task = service.update_task(task_id, task_data.model_dump(), user_id)

    return TaskBody.model_validate(updated_task).model_dump()


@tasks_bp.patch("/tasks/<int:task_id>")
@jwt_required()
def patch_task(task_id: int):
    user_id = get_jwt_identity()
    if not user_id:
        abort(401, "Invalid token")
    user_id = int(user_id)

    request.max_content_length = 1024 * 1024
    payload = request.get_json(silent=True) or {}
    try:
        task_data = TaskPatch(**payload)
    except ValidationError as e:
        abort(400, str(e))

    patched_task = service.update_task(
        task_id, task_data.model_dump(exclude_unset=True), user_id
    )

    return TaskBody.model_validate(patched_task).model_dump()


@tasks_bp.delete("/tasks/<int:task_id>")
@jwt_required()
def delete_task(task_id: int):
    user_id = get_jwt_identity()
    if not user_id:
        abort(401, "Invalid token")
    user_id = int(user_id)

    service.delete_task(task_id, user_id)
    return {}, 204