from flask_jwt_extended import jwt_required

from app.api.blueprint import BareDoBlueprint
from app.api.helpers import get_current_user_id
from app.api.v1.schemas.subtasks_schemas import (
    SubtaskBody,
    SubtaskCreate,
    SubtaskListResponse,
    SubtaskPath,
    SubtaskUpdate,
)
from app.api.v1.schemas.tasks_schemas import TaskPath
from app.services.subtasks_service import SubtasksService

subtasks_bp = BareDoBlueprint("subtasks", __name__, url_prefix="/api/v1")
service = SubtasksService()


@subtasks_bp.get("/tasks/<int:task_id>/subtasks")
@jwt_required()
def get_subtasks(path: TaskPath):
    """List subtasks for a task."""
    user_id = get_current_user_id()
    subtasks = service.get_task_subtasks(path.task_id, user_id)
    return SubtaskListResponse(subtasks=[SubtaskBody.model_validate(s) for s in subtasks]), 200


@subtasks_bp.post("/tasks/<int:task_id>/subtasks")
@jwt_required()
def create_subtask(path: TaskPath, body: SubtaskCreate):
    """Create a subtask for a task."""
    user_id = get_current_user_id()
    subtask = service.create_subtask(path.task_id, body.model_dump(), user_id)
    return SubtaskBody.model_validate(subtask), 201


@subtasks_bp.patch("/tasks/<int:task_id>/subtasks/<int:subtask_id>")
@jwt_required()
def update_subtask(path: SubtaskPath, body: SubtaskUpdate):
    """Update a subtask (title and/or completed)."""
    user_id = get_current_user_id()
    subtask = service.update_subtask(
        path.task_id, path.subtask_id, body.model_dump(exclude_unset=True), user_id
    )
    return SubtaskBody.model_validate(subtask), 200


@subtasks_bp.delete("/tasks/<int:task_id>/subtasks/<int:subtask_id>")
@jwt_required()
def delete_subtask(path: SubtaskPath):
    """Delete a subtask."""
    user_id = get_current_user_id()
    service.delete_subtask(path.task_id, path.subtask_id, user_id)
    return "", 204
