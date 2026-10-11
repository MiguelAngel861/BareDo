from flask_jwt_extended import jwt_required

from app.api.blueprint import BareDoBlueprint
from app.api.helpers import get_current_user_id
from app.api.v1.schemas.tags_schemas import (
    TagBody,
    TagCreate,
    TagListResponse,
    TagPath,
)
from app.services.tags_service import TagsService

tags_bp = BareDoBlueprint("tags", __name__, url_prefix="/api/v1")
service = TagsService()


@tags_bp.get("/tags")
@jwt_required()
def get_tags():
    """List all tags for the authenticated user."""
    user_id = get_current_user_id()
    tags = service.get_all_user_tags(user_id)
    return TagListResponse(tags=[TagBody.model_validate(tag) for tag in tags]), 200


@tags_bp.post("/tags")
@jwt_required()
def create_tag(body: TagCreate):
    """Create a new tag for the authenticated user."""
    user_id = get_current_user_id()
    tag = service.create_tag(body.name, user_id)
    return TagBody.model_validate(tag), 201


@tags_bp.delete("/tags/<int:tag_id>")
@jwt_required()
def delete_tag(path: TagPath):
    """Delete a tag belonging to the authenticated user."""
    user_id = get_current_user_id()
    service.delete_tag(path.tag_id, user_id)
    return "", 204
