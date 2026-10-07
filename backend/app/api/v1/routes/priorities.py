from flask_jwt_extended import jwt_required

from app.api.blueprint import BareDoBlueprint
from app.api.v1.schemas.priorities_schemas import PriorityBody, PriorityResponse
from app.services.priorities_service import PrioritiesService

priorities_bp = BareDoBlueprint("priorities", __name__, url_prefix="/api/v1")
service = PrioritiesService()


@priorities_bp.get("/priorities")
@jwt_required()
def get_priorities():
    """List all priority levels."""
    priorities = service.get_all_priorities()
    return PriorityResponse(priorities=[PriorityBody.model_validate(p) for p in priorities]), 200
