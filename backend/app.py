from flask import Flask, jsonify, request
from flask_cors import CORS
from services.diagnosis_service import DiagnosisService

app = Flask(__name__)
# Enable CORS for all routes (for development convenience)
CORS(app)

diagnosis_service = DiagnosisService()

@app.route('/')
def hello():
    return jsonify({"message": "Hello from Flask Backend!"})

@app.route('/api/diagnosis', methods=['POST'])
def diagnose():
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
