from flask import Blueprint, abort, request
from flask_jwt_extended import jwt_required
from pydantic import ValidationError

from app.api.helpers import get_current_user_id
from app.api.v1.presenters.tasks_presenter import present_task, present_task_list
from app.api.v1.schemas.tasks_schemas import (
    TaskCreate,
    TaskListQuery,
    TaskPatch,
    TaskUpdate,
)
from app.services.tasks_service import TasksService

tasks_bp = Blueprint("tasks", __name__)
service = TasksService()


@tasks_bp.get("/tasks")
@jwt_required()
def get_tasks():
    user_id = get_current_user_id()

    try:
        query = TaskListQuery(**request.args)
    except ValidationError as e:
        abort(400, str(e))

    filters = {
        "title": query.title,
        "description": query.description,
        "completed": query.completed,
    }

    tasks, meta_data = service.get_all_tasks(
        query.page, query.per_page, filters, query.sort, user_id
    )

    return present_task_list(tasks, meta_data), 200


@tasks_bp.get("/tasks/<int:task_id>")
@jwt_required()
def get_task_by_id(task_id: int):
    user_id = get_current_user_id()

    task = service.get_task_by_id(task_id, user_id)
    return present_task(task), 200


@tasks_bp.post("/tasks")
@jwt_required()
def add_task():
    user_id = get_current_user_id()

    payload = request.get_json(silent=True) or {}
    try:
        task_data = TaskCreate(**payload)
    except ValidationError as e:
        abort(400, str(e))

    new_task = service.add_new_task(task_data.model_dump(), user_id)

    return present_task(new_task), 201


@tasks_bp.put("/tasks/<int:task_id>")
@jwt_required()
def update_task(task_id: int):
    user_id = get_current_user_id()

    payload = request.get_json(silent=True) or {}
    try:
        task_data = TaskUpdate(**payload)
    except ValidationError as e:
        abort(400, str(e))

    updated_task = service.update_task(task_id, task_data.model_dump(), user_id)

    return present_task(updated_task)


@tasks_bp.patch("/tasks/<int:task_id>")
@jwt_required()
def patch_task(task_id: int):
    user_id = get_current_user_id()

    payload = request.get_json(silent=True) or {}
    try:
        task_data = TaskPatch(**payload)
    except ValidationError as e:
        abort(400, str(e))

    patched_task = service.update_task(task_id, task_data.model_dump(exclude_unset=True), user_id)

    return present_task(patched_task)


@tasks_bp.delete("/tasks/<int:task_id>")
@jwt_required()
def delete_task(task_id: int):
    user_id = get_current_user_id()

    service.delete_task(task_id, user_id)
    return {}, 204
