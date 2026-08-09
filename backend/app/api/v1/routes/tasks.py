from flask import Blueprint
from flask_jwt_extended import jwt_required
from flask_pydantic import validate

from app.api.helpers import get_current_user_id
from app.api.v1.schemas.tasks_schemas import (
    TaskBody,
    TaskCreate,
    TaskListQuery,
    TaskPatch,
    TaskResponse,
    TaskUpdate,
)
from app.services.tasks_service import TasksService

tasks_bp = Blueprint("tasks", __name__)
service = TasksService()


@tasks_bp.get("/tasks")
@jwt_required()
@validate(query=TaskListQuery)
def get_tasks(query: TaskListQuery):
    """List tasks with pagination and filters."""
    user_id = get_current_user_id()

    filters = {
        "title": query.title,
        "description": query.description,
        "completed": query.completed,
    }

    tasks, pagination = service.get_all_tasks(
        query.page, query.per_page, filters, query.sort, user_id
    )

    return TaskResponse(
        tasks=[TaskBody.model_validate(task) for task in tasks],
        meta=pagination.to_dict(),
    ), 200


@tasks_bp.get("/tasks/<int:task_id>")
@jwt_required()
@validate()
def get_task_by_id(task_id: int):
    """Get a task by ID."""
    user_id = get_current_user_id()

    task = service.get_task_by_id(task_id, user_id)
    return TaskBody.model_validate(task), 200


@tasks_bp.post("/tasks")
@jwt_required()
@validate(body=TaskCreate)
def add_task(body: TaskCreate):
    """Create a new task."""
    user_id = get_current_user_id()

    new_task = service.add_new_task(body.model_dump(), user_id)
    return TaskBody.model_validate(new_task), 201


@tasks_bp.put("/tasks/<int:task_id>")
@jwt_required()
@validate(body=TaskUpdate)
def update_task(task_id: int, body: TaskUpdate):
    """Update a task (full)."""
    user_id = get_current_user_id()

    updated_task = service.update_task(task_id, body.model_dump(), user_id)
    return TaskBody.model_validate(updated_task), 200


@tasks_bp.patch("/tasks/<int:task_id>")
@jwt_required()
@validate(body=TaskPatch)
def patch_task(task_id: int, body: TaskPatch):
    """Update a task (partial)."""
    user_id = get_current_user_id()

    patched_task = service.update_task(task_id, body.model_dump(exclude_unset=True), user_id)
    return TaskBody.model_validate(patched_task), 200


@tasks_bp.delete("/tasks/<int:task_id>")
@jwt_required()
def delete_task(task_id: int):
    """Delete a task."""
    user_id = get_current_user_id()

    service.delete_task(task_id, user_id)
    return {}, 204
