from flask import Flask, redirect
from flask_cors import CORS
from flasgger import Swagger
from routers.health import health_bp
from routers.stress_check import stress_check_bp

app = Flask(__name__)
# Enable CORS for all routes (for development convenience)
CORS(app)
swagger = Swagger(app)

# Register Blueprints
app.register_blueprint(health_bp)
app.register_blueprint(stress_check_bp)

@app.route('/')
def index():
    return redirect('/apidocs')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
