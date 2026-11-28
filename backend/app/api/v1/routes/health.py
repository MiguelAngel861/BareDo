from flask import jsonify
from flask_openapi import APIBlueprint
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.extensions import db

health_bp = APIBlueprint("health", __name__)


@health_bp.get("/health")
def health_check():
    """Health check endpoint.

    responses:
      200:
        description: Service is healthy
      503:
        description: Database unreachable
    """
    try:
        db.session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        return jsonify({"status": "unhealthy", "service": "bare-do-api"}), 503
    return jsonify({"status": "healthy", "service": "bare-do-api"}), 200
