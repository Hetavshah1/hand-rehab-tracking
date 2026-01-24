from flask import Flask
from flask_cors import CORS
from extensions import db, jwt
import os

app = Flask(__name__)
# Read configuration from environment with safe development defaults
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql://postgres:Ved%402025@localhost:5432/exoskeleton_db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# Do NOT hardcode secrets in source. Use an environment variable in production.
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret')

# Restrict CORS to the frontend origin in development (change via FRONTEND_ORIGIN env var)
frontend_origin = os.environ.get('FRONTEND_ORIGIN', 'http://localhost:3000')
CORS(app, origins=[frontend_origin], supports_credentials=True)

db.init_app(app)
jwt.init_app(app)

from routes import auth, doctor, patient

app.register_blueprint(auth.auth_bp)
app.register_blueprint(doctor.doctor_bp)
app.register_blueprint(patient.patient_bp)

if __name__ == '__main__':
    app.run(debug=True) 