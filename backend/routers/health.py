from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/health-check')
def health_check():
    """
    Health Check Endpoint
    ---
    tags:
      - Health
    responses:
      200:
        description: Backend is running
        schema:
          type: object
          properties:
            message:
              type: string
    """
    return jsonify({"message": "Hello from Flask Backend!"})
