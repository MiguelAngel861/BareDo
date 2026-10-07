from flask_jwt_extended import jwt_required

from app.api.blueprint import BareDoBlueprint
from app.api.helpers import get_current_user_id
from app.api.v1.schemas.tasks_schemas import (
    TaskBody,
    TaskCreate,
    TaskListQuery,
    TaskPatch,
    TaskPath,
    TaskResponse,
    TaskUpdate,
)
from app.services.tasks_service import TasksService

tasks_bp = BareDoBlueprint("tasks", __name__, url_prefix="/api/v1")
service = TasksService()


@tasks_bp.get("/tasks")
@jwt_required()
def get_tasks(query: TaskListQuery):
    """List tasks with pagination and filters."""
    user_id = get_current_user_id()

    filters = {
        "title": query.title,
        "description": query.description,
        "completed": query.completed,
        "priority_id": query.priority_id,
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
def get_task_by_id(path: TaskPath):
    """Get a task by ID."""
    user_id = get_current_user_id()

    task = service.get_task_by_id(path.task_id, user_id)
    return TaskBody.model_validate(task), 200


@tasks_bp.post("/tasks")
@jwt_required()
def add_task(body: TaskCreate):
    """Create a new task."""
    user_id = get_current_user_id()

    new_task = service.add_new_task(body.model_dump(), user_id)
    return TaskBody.model_validate(new_task), 201


@tasks_bp.put("/tasks/<int:task_id>")
@jwt_required()
def update_task(path: TaskPath, body: TaskUpdate):
    """Update a task (full)."""
    user_id = get_current_user_id()

    updated_task = service.update_task(path.task_id, body.model_dump(), user_id)
    return TaskBody.model_validate(updated_task), 200


@tasks_bp.patch("/tasks/<int:task_id>")
@jwt_required()
def patch_task(path: TaskPath, body: TaskPatch):
    """Update a task (partial)."""
    user_id = get_current_user_id()

    patched_task = service.update_task(path.task_id, body.model_dump(exclude_unset=True), user_id)
    return TaskBody.model_validate(patched_task), 200


@tasks_bp.delete("/tasks/<int:task_id>")
@jwt_required()
def delete_task(path: TaskPath):
    """Delete a task."""
    user_id = get_current_user_id()

    service.delete_task(path.task_id, user_id)
    return "", 204
