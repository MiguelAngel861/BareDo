from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health_check():
    """Health check endpoint.

    responses:
      200:
        description: Service is healthy
    """
    return jsonify({"status": "healthy", "service": "bare-do-api"}), 200
