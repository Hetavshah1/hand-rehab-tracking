from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User, PatientProfile, Session, Progress, Goal, AssignedExercise, Exercise, Message, DoctorProfile, ConsentForm
from datetime import datetime
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

patient_bp = Blueprint('patient', __name__)

def patient_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if user.role != 'patient':
            return jsonify({'msg': 'Patient access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@patient_bp.route('/profile', methods=['GET'])
@jwt_required()
@patient_required
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    profile = PatientProfile.query.filter_by(user_id=user.id).first()
    return jsonify({'id': profile.id, 'name': user.name, 'email': user.email, 'age': profile.age, 'diagnosis': profile.diagnosis})

@patient_bp.route('/sessions', methods=['GET'])
@jwt_required()
@patient_required
def get_sessions():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    profile = PatientProfile.query.filter_by(user_id=user.id).first()
    sessions = Session.query.filter_by(patient_id=profile.id).all()
    session_data = []
    for s in sessions:
        progresses = Progress.query.filter_by(session_id=s.id).all()
        progress_data = [{'metric_name': pr.metric_name, 'value': pr.value, 'goal': pr.goal} for pr in progresses]
        session_data.append({'id': s.id, 'date': s.date, 'notes': s.notes, 'progress': progress_data})
    return jsonify(session_data)

@patient_bp.route('/goals', methods=['GET'])
@jwt_required()
@patient_required
def get_my_goals():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    profile = PatientProfile.query.filter_by(user_id=user.id).first()
    goals = Goal.query.filter_by(patient_id=profile.id).all()
    result = []
    for g in goals:
        result.append({
            'id': g.id,
            'description': g.description,
            'target_value': g.target_value,
            'metric_name': g.metric_name,
            'deadline': g.deadline.isoformat() if g.deadline else None,
            'achieved': g.achieved,
            'created_at': g.created_at.isoformat()
        })
    return jsonify(result)

@patient_bp.route('/assigned_exercises', methods=['GET'])
@jwt_required()
@patient_required
def get_my_assigned_exercises():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    profile = PatientProfile.query.filter_by(user_id=user.id).first()
    assigned = AssignedExercise.query.filter_by(patient_id=profile.id).all()
    result = []
    for a in assigned:
        ex = Exercise.query.get(a.exercise_id)
        result.append({
            'id': a.id,
            'exercise': {
                'id': ex.id,
                'name': ex.name,
                'description': ex.description,
                'video_url': ex.video_url,
                'image_url': ex.image_url
            },
            'notes': a.notes,
            'assigned_date': a.assigned_date.isoformat()
        })
    return jsonify(result)

@patient_bp.route('/messages', methods=['GET'])
@jwt_required()
@patient_required
def get_my_messages():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    profile = PatientProfile.query.filter_by(user_id=user.id).first()
    doctor_profile = DoctorProfile.query.get(profile.doctor_id) if profile.doctor_id else None
    if not doctor_profile:
        return jsonify([])
    messages = Message.query.filter_by(patient_id=profile.id, doctor_id=doctor_profile.id).order_by(Message.timestamp).all()
    result = []
    for m in messages:
        result.append({
            'id': m.id,
            'sender_id': m.sender_id,
            'receiver_id': m.receiver_id,
            'content': m.content,
            'timestamp': m.timestamp.isoformat()
        })
    return jsonify(result)

@patient_bp.route('/messages', methods=['POST'])
@jwt_required()
@patient_required
def send_my_message():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    profile = PatientProfile.query.filter_by(user_id=user.id).first()
    doctor_profile = DoctorProfile.query.get(profile.doctor_id) if profile.doctor_id else None
    if not doctor_profile:
        return jsonify({'msg': 'No doctor assigned'}), 400
    data = request.get_json()
    content = data.get('content')
    message = Message(
        sender_id=user.id,
        receiver_id=doctor_profile.user_id,
        patient_id=profile.id,
        doctor_id=doctor_profile.id,
        content=content
    )
    db.session.add(message)
    db.session.commit()
    return jsonify({'msg': 'Message sent', 'message_id': message.id}), 201

@patient_bp.route('/consent_form', methods=['GET', 'POST'])
@jwt_required()
@patient_required
def consent_form():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    profile = PatientProfile.query.filter_by(user_id=user.id).first()
    if request.method == 'GET':
        form = ConsentForm.query.filter_by(patient_id=profile.id).order_by(ConsentForm.id.desc()).first()
        if not form:
            # Provide a default consent form content
            content = "I consent to participate in exoskeleton therapy."
            form = ConsentForm(patient_id=profile.id, content=content)
            db.session.add(form)
            db.session.commit()
        return jsonify({
            'id': form.id,
            'content': form.content,
            'signed': form.signed,
            'signed_at': form.signed_at,
            'patient_name': form.patient_name,
            'patient_signature': form.patient_signature
        })
    else:
        data = request.get_json()
        form = ConsentForm.query.filter_by(patient_id=profile.id).order_by(ConsentForm.id.desc()).first()
        form.signed = True
        form.signed_at = datetime.utcnow()
        form.patient_name = data.get('patient_name')
        form.patient_signature = data.get('patient_signature')
        db.session.commit()
        return jsonify({'msg': 'Consent form signed'})

@patient_bp.route('/progress_report', methods=['GET'])
@jwt_required()
@patient_required
def download_progress_report():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    profile = PatientProfile.query.filter_by(user_id=user.id).first()
    sessions = Session.query.filter_by(patient_id=profile.id).all()
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    p.setFont("Helvetica", 12)
    p.drawString(100, 750, f"Progress Report for {user.name}")
    y = 720
    for s in sessions:
        p.drawString(100, y, f"Session {s.id} - {s.date.strftime('%Y-%m-%d') if s.date else ''}")
        y -= 20
        p.drawString(120, y, f"Notes: {s.notes}")
        y -= 20
        for pr in s.progresses:
            p.drawString(140, y, f"{pr.metric_name}: {pr.value} (Goal: {pr.goal})")
            y -= 20
        y -= 10
        if y < 100:
            p.showPage()
            y = 750
    p.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name='progress_report.pdf', mimetype='application/pdf') 