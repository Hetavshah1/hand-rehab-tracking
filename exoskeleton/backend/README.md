# Exoskeleton Therapy Progress Tracker Backend

## Setup Instructions

1. **Create and activate a virtual environment** (if not already done):
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate
   ```

2. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Initialize the database:**
   In a Python shell or by adding this to a script:
   ```python
   from app import db
   db.create_all()
   ```

4. **Run the Flask app:**
   ```powershell
   python app.py
   ```

## API Endpoints

- `/signup` (POST): Register as doctor or patient
- `/login` (POST): Login and get JWT token
- `/me` (GET): Get current user info

### Doctor Endpoints (require doctor JWT)
- `/patients` (GET): List all patients
- `/patients/<patient_id>` (GET): Get patient details and progress
- `/patients/<patient_id>/session` (POST): Add a session for a patient
- `/sessions/<session_id>/progress` (POST): Add progress to a session

### Patient Endpoints (require patient JWT)
- `/profile` (GET): Get own profile
- `/sessions` (GET): Get own sessions and progress

---

## Environment variables

This project reads a few configuration values from environment variables (recommended for development and required for production deployments):

- `DATABASE_URL` - SQLAlchemy database URI. Default: `sqlite:///exoskeleton.db` (dev).
- `JWT_SECRET_KEY` - Secret used by Flask-JWT-Extended. Default: `dev-secret` (development only). Set this to a strong random value in production.
- `FRONTEND_ORIGIN` - Origin allowed by CORS (default: `http://localhost:3000`).
- `SMTP_SERVER` - (optional) SMTP server hostname (default: `smtp.gmail.com`).
- `SMTP_PORT` - (optional) SMTP server port (default: `587`).
- `SMTP_USER` - (optional) SMTP username (required for sending emails).
- `SMTP_PASSWORD` - (optional) SMTP password or app password (required for sending emails).

---

**Next:** I will scaffold the frontend React app and connect it to this backend.
