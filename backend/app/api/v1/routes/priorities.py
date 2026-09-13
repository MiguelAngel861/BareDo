from flask import Blueprint
from flask_jwt_extended import jwt_required
from flask_pydantic import validate

from app.api.v1.schemas.priorities_schemas import PriorityBody, PriorityResponse
from app.services.priorities_service import PrioritiesService

priorities_bp = Blueprint("priorities", __name__)
service = PrioritiesService()


@priorities_bp.get("/priorities")
@jwt_required()
@validate()
def get_priorities():
    """List all priority levels."""
    priorities = service.get_all_priorities()
    return PriorityResponse(
        priorities=[PriorityBody.model_validate(p) for p in priorities]
    ), 200
