from collections.abc import Sequence

from app.api.v1.schemas.tasks_schemas import TaskBody, TaskResponse
from app.core.pagination import Pagination
from app.models.tasks import Tasks


def present_task(task: Tasks) -> dict:
    return TaskBody.model_validate(task).model_dump(mode="json")


def present_task_list(tasks: Sequence[Tasks], pagination: Pagination) -> dict:
    return TaskResponse(
        tasks=[TaskBody.model_validate(task) for task in tasks],
        meta=pagination.to_dict(),
    ).model_dump(mode="json")
