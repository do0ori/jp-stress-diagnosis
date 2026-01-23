from flask import Blueprint, jsonify, request
from services.diagnosis_service import DiagnosisService

stress_check_bp = Blueprint('stress_check', __name__)

diagnosis_service = DiagnosisService()

@stress_check_bp.route('/api/diagnosis', methods=['POST'])
def diagnose():
    """
    JP Job/Stress Diagnosis Endpoint
    ---
    tags:
      - Stress Check
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            gender:
              type: string
              enum: [male, female]
              description: Gender of the user (affects scaling).
            answers:
              type: object
              description: Dictionary of Question ID to Answer Index (1-4).
              example:
                A1: 1
                A2: 3
                B1: 4
    responses:
      200:
        description: Diagnosis result with spider chart data
        schema:
          type: object
          properties:
            result:
              type: object
              properties:
                high_stress:
                  type: boolean
                summary_scores:
                  type: object
                  properties:
                    sum_a:
                      type: integer
                    sum_b:
                      type: integer
                    sum_c:
                      type: integer
            charts:
              type: array
              items:
                type: object
                properties:
                  label:
                    type: string
                  axes:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        label:
                          type: string
                        score:
                          type: integer
      400:
        description: Invalid input
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400
            
        gender = data.get('gender')
        answers = data.get('answers')
        
        if not gender or not answers:
            return jsonify({"error": "Missing 'gender' or 'answers'"}), 400
            
        if gender not in ['male', 'female']:
             return jsonify({"error": "Invalid gender. Must be 'male' or 'female'"}), 400

        result = diagnosis_service.calculate(answers, gender)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@stress_check_bp.route('/api/questions', methods=['GET'])
def get_questions():
    """
    Get All Survey Questions
    ---
    tags:
      - Stress Check
    responses:
      200:
        description: List of all 57 questions
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
                example: "A1"
              section:
                type: string
                example: "A"
              number:
                type: integer
                example: 1
              text:
                type: string
                example: "매우 많은 일을 해야 한다"
              options:
                type: array
                items:
                  type: object
                  properties:
                    label:
                      type: string
                    score:
                      type: integer
    """
    return jsonify(diagnosis_service.questions)
