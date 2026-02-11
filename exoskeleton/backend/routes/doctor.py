import os
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from werkzeug.utils import secure_filename
import time
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db, send_email, jwt
from models import User , DoctorProfile, Exercise
from sqlalchemy import text
from cv.record_reference import HandRecorder
import threading

print(">>> doctor.py LOADED <<<")
recorder = None
recording_thread = None

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

doctor_bp = Blueprint('doctor', __name__)

doctor_bp.upload_folder = UPLOAD_FOLDER

def doctor_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if user.role != 'doctor':
            return jsonify({'msg': 'Doctor access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@doctor_bp.route('/patients', methods=['GET'])
@jwt_required()
@doctor_required
def get_patients():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    doctor_profile = DoctorProfile.query.filter_by(user_id=user.id).first()
    if not doctor_profile:
        return jsonify([])
    patients = PatientProfile.query.filter_by(doctor_id=doctor_profile.id).all()
    result = []
    for p in patients:
        u = User.query.get(p.user_id)
        result.append({'id': p.id, 'name': u.name, 'email': u.email, 'age': p.age, 'diagnosis': p.diagnosis})
    return jsonify(result)

@doctor_bp.route('/patients/unassigned', methods=['GET'])
@jwt_required()
@doctor_required
def get_unassigned_patients():
    patients = PatientProfile.query.filter_by(doctor_id=None).all()
    result = []
    for p in patients:
        u = User.query.get(p.user_id)
        result.append({'id': p.id, 'name': u.name, 'email': u.email, 'age': p.age, 'diagnosis': p.diagnosis})
    return jsonify(result)

@doctor_bp.route('/patients/<int:patient_id>', methods=['GET'])
@jwt_required()
@doctor_required
def get_patient(patient_id):
    patient_profile = PatientProfile.query.get(patient_id)
    if not patient_profile:
        return jsonify({'error': 'Patient not found'}), 404
    
    user = User.query.get(patient_profile.user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get sessions with progress
    sessions = Session.query.filter_by(patient_id=patient_profile.id).all()
    sessions_data = []
    for session in sessions:
        progress_data = []
        for progress in session.progresses:
            progress_data.append({
                'id': progress.id,
                'metric_name': progress.metric_name,
                'value': progress.value,
                'goal': progress.goal
            })
        
        sessions_data.append({
            'id': session.id,
            'date': session.date.isoformat() if session.date else None,
            'notes': session.notes,
            'notes_file': session.notes_file,
            'progress': progress_data
        })
    
    return jsonify({
        'id': patient_profile.id,
        'user_id': user.id,
        'name': user.name,
        'email': user.email,
        'age': patient_profile.age,
        'diagnosis': patient_profile.diagnosis,
        'sessions': sessions_data
    })

@doctor_bp.route('/patients/<int:patient_id>/assign', methods=['POST'])
@jwt_required()
@doctor_required
def assign_patient(patient_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    doctor_profile = DoctorProfile.query.filter_by(user_id=user.id).first()
    patient = PatientProfile.query.get_or_404(patient_id)
    patient.doctor_id = doctor_profile.id
    db.session.commit()
    return jsonify({'msg': 'Patient assigned to doctor'})


@doctor_bp.route('/patients/<int:patient_id>/session', methods=['POST'])
@jwt_required()
@doctor_required
def add_session(patient_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    doctor_profile = DoctorProfile.query.filter_by(user_id=user.id).first()
    data = request.get_json()
    notes = data.get('notes')
    session = Session(patient_id=patient_id, doctor_id=doctor_profile.id, notes=notes)
    db.session.add(session)
    db.session.commit()
    # Send email reminder to patient
    patient_profile = PatientProfile.query.get(patient_id)
    patient_user = User.query.get(patient_profile.user_id)
    send_email(
        to_email=patient_user.email,
        subject='New Therapy Session Scheduled',
        body=f'Dear {patient_user.name},\n\nA new therapy session has been scheduled for you.\nNotes: {notes}\n\nBest regards,\nYour Therapy Team'
    )
    return jsonify({'msg': 'Session added', 'session_id': session.id}), 201

@doctor_bp.route('/sessions/<int:session_id>/progress', methods=['POST'])
@jwt_required()
@doctor_required
def add_progress(session_id):
    data = request.get_json()
    metric_name = data.get('metric_name')
    value = data.get('value')
    goal = data.get('goal')
    progress = Progress(session_id=session_id, metric_name=metric_name, value=value, goal=goal)
    db.session.add(progress)
    db.session.commit()
    return jsonify({'msg': 'Progress added'}), 201

@doctor_bp.route('/patients/<int:patient_id>/goals', methods=['GET'])
@jwt_required()
@doctor_required
def get_patient_goals(patient_id):
    goals = Goal.query.filter_by(patient_id=patient_id).all()
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

@doctor_bp.route('/patients/<int:patient_id>/goals', methods=['POST'])
@jwt_required()
@doctor_required
def add_goal(patient_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    doctor_profile = DoctorProfile.query.filter_by(user_id=user.id).first()
    data = request.get_json()
    description = data.get('description')
    target_value = data.get('target_value')
    metric_name = data.get('metric_name')
    deadline = data.get('deadline')
    goal = Goal(
        patient_id=patient_id,
        doctor_id=doctor_profile.id,
        description=description,
        target_value=target_value,
        metric_name=metric_name,
        deadline=deadline
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify({'msg': 'Goal added', 'goal_id': goal.id}), 201

@doctor_bp.route('/goals/<int:goal_id>', methods=['PUT'])
@jwt_required()
@doctor_required
def edit_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)
    data = request.get_json()
    goal.description = data.get('description', goal.description)
    goal.target_value = data.get('target_value', goal.target_value)
    goal.metric_name = data.get('metric_name', goal.metric_name)
    if 'deadline' in data:
        goal.deadline = data['deadline']
    if 'achieved' in data:
        goal.achieved = data['achieved']
    db.session.commit()
    return jsonify({'msg': 'Goal updated'})

@doctor_bp.route('/sessions/<int:session_id>/upload', methods=['POST'])
@jwt_required()
@doctor_required
def upload_session_file(session_id):
    if 'file' not in request.files:
        return jsonify({'msg': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400
    filename = f"session_{session_id}_" + file.filename
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    session = Session.query.get_or_404(session_id)
    session.notes_file = filename
    db.session.commit()
    return jsonify({'msg': 'File uploaded', 'filename': filename})

@doctor_bp.route('/uploads/<filename>', methods=['GET'])
def get_uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@doctor_bp.route('/exercises', methods=['GET'])
@jwt_required()
@doctor_required
def get_exercises():
    exercises = Exercise.query.all()

    return jsonify([
        {
            "id": ex.id,
            "name": ex.name,
            "description": ex.description
        }
        for ex in exercises
    ]), 200


@doctor_bp.route('/exercises', methods=['POST'])
@jwt_required()
@doctor_required
def add_exercise():
    name = request.form.get('name')
    description = request.form.get('description')

    if not name:
        return jsonify({'error': 'Exercise name is required'}), 400

    ex = Exercise(
        name=name,
        description=description,
       
    )

    db.session.add(ex)
    db.session.commit()

    return jsonify({
        'id': ex.id,
        'name': ex.name,
        'description': ex.description
    }), 201



@doctor_bp.route('/exercises/upload', methods=['POST'])
@jwt_required()
@doctor_required
def upload_exercise():
    # Accepts multipart/form-data with fields: file (video), name (optional), description (optional)
    if 'file' not in request.files:
        return jsonify({'msg': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400

    name = request.form.get('name') or file.filename
    description = request.form.get('description')

    filename = f"exercise_{int(time.time())}_" + secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Create Exercise record pointing to uploaded file
    ex = Exercise(
    name=name,
    description=description
)

    db.session.add(ex)
    db.session.commit()

    return jsonify({'msg': 'Exercise uploaded', 'exercise': {'id': ex.id, 'name': ex.name, }}), 201

@doctor_bp.route('/exercises/<int:exercise_id>/reference/start', methods=['POST'])
@jwt_required()
@doctor_required
def start_reference_recording(exercise_id):
    global recorder, recording_thread

    upload_dir = doctor_bp.upload_folder
    recorder = HandRecorder(upload_dir)

    filename = f"ref_{exercise_id}_{int(time.time())}"
    recorder.start(filename)

    def loop():
        while recorder.recording:
            recorder.capture_frame()

    recording_thread = threading.Thread(target=loop)
    recording_thread.start()

    return jsonify({"msg": "Recording started"}), 200

@doctor_bp.route('/exercises/<int:exercise_id>/reference/stop', methods=['POST'])
@jwt_required()
@doctor_required
def stop_reference_recording(exercise_id):
    global recorder

    video_path, pkl_path = recorder.stop()

    return jsonify({
        "mp4": f"/uploads/{os.path.basename(video_path)}",
        "pkl": f"/uploads/{os.path.basename(pkl_path)}"
    }), 200

@doctor_bp.route('/exercises/<int:exercise_id>', methods=['PUT'])
@jwt_required()
@doctor_required
def edit_exercise(exercise_id):
    ex = Exercise.query.get_or_404(exercise_id)
    data = request.get_json()
    ex.name = data.get('name', ex.name)
    ex.description = data.get('description', ex.description)
    
    db.session.commit()
    return jsonify({'msg': 'Exercise updated'})

@doctor_bp.route('/exercises/<int:exercise_id>', methods=['DELETE'])
@jwt_required()
@doctor_required
def delete_exercise(exercise_id):
    ex = Exercise.query.get_or_404(exercise_id)
    db.session.delete(ex)
    db.session.commit()
    return jsonify({'msg': 'Exercise deleted'})

@doctor_bp.route('/patients/<int:patient_id>/assign_exercise', methods=['POST'])
@jwt_required()
@doctor_required
def assign_exercise(patient_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    doctor_profile = DoctorProfile.query.filter_by(user_id=user.id).first()
    data = request.get_json()
    exercise_id = data.get('exercise_id')
    notes = data.get('notes')
    assigned = AssignedExercise(
        patient_id=patient_id,
        doctor_id=doctor_profile.id,
        exercise_id=exercise_id,
        notes=notes
    )
    db.session.add(assigned)
    db.session.commit()
    # Send email reminder to patient
    patient_profile = PatientProfile.query.get(patient_id)
    patient_user = User.query.get(patient_profile.user_id)
    exercise = Exercise.query.get(exercise_id)
    send_email(
        to_email=patient_user.email,
        subject='New Exercise Assigned',
        body=f'Dear {patient_user.name},\n\nA new exercise has been assigned to you: {exercise.name}.\nNotes: {notes}\n\nBest regards,\nYour Therapy Team'
    )
    return jsonify({'msg': 'Exercise assigned', 'assigned_id': assigned.id}), 201

@doctor_bp.route('/patients/<int:patient_id>/assigned_exercises', methods=['GET'])
@jwt_required()
@doctor_required
def get_assigned_exercises(patient_id):
    assigned = AssignedExercise.query.filter_by(patient_id=patient_id).all()
    result = []
    for a in assigned:
        ex = Exercise.query.get(a.exercise_id)
        result.append({
            'id': a.id,
            'exercise': {
                'id': ex.id,
                'name': ex.name,
                'description': ex.description,
                
            },
            'notes': a.notes,
            'assigned_date': a.assigned_date.isoformat()
        })
    return jsonify(result)



@doctor_bp.route('/exercises/<int:exercise_id>/reference', methods=['POST'])
@jwt_required()
@doctor_required
def upload_reference_recording(exercise_id):
    if 'video' not in request.files or 'angles' not in request.files:
        return jsonify({'msg': 'Both video and pkl files are required'}), 400

    video = request.files['video']
    angles = request.files['angles']

    if video.filename == '' or angles.filename == '':
        return jsonify({'msg': 'Empty filename'}), 400

    # Save files
    timestamp = int(time.time())
    video_filename = f"ref_{exercise_id}_{timestamp}.mp4"
    pkl_filename = f"ref_{exercise_id}_{timestamp}.pkl"

    video_path = os.path.join(UPLOAD_FOLDER, video_filename)
    pkl_path = os.path.join(UPLOAD_FOLDER, pkl_filename)

    video.save(video_path)
    angles.save(pkl_path)

    # Insert paired record into DB
    result = db.session.execute(
        text("""
            INSERT INTO reference_recordings (exercise_id, video_path, pkl_path)
            VALUES (:exercise_id, :video_path, :pkl_path)
            RETURNING id
        """),
        {
            "exercise_id": exercise_id,
            "video_path": f"/uploads/{video_filename}",
            "pkl_path": f"/uploads/{pkl_filename}"
        }
    )

    reference_id = result.scalar()
    db.session.commit()

    return jsonify({
        'msg': 'Reference recording uploaded',
        'reference_id': reference_id
    }), 201

@doctor_bp.route('/reference/<int:reference_id>/files', methods=['GET'])
@jwt_required()
@doctor_required
def get_reference_files(reference_id):
    record = db.session.execute(
        text("""
            SELECT video_path, pkl_path
            FROM reference_recordings
            WHERE id = :id
        """),
        {"id": reference_id}
    ).mappings().first()

    if not record:
        return jsonify({'msg': 'Reference not found'}), 404

    return jsonify({
        'mp4': record['video_path'],
        'pkl': record['pkl_path']
    })

@doctor_bp.route('/patients/<int:patient_id>/messages', methods=['GET'])
@jwt_required()
@doctor_required
def get_patient_messages(patient_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    doctor_profile = DoctorProfile.query.filter_by(user_id=user.id).first()
    messages = Message.query.filter_by(patient_id=patient_id, doctor_id=doctor_profile.id).order_by(Message.timestamp).all()
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

@doctor_bp.route('/patients/<int:patient_id>/messages', methods=['POST'])
@jwt_required()
@doctor_required
def send_patient_message(patient_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    doctor_profile = DoctorProfile.query.filter_by(user_id=user.id).first()
    patient_profile = PatientProfile.query.get_or_404(patient_id)
    data = request.get_json()
    content = data.get('content')
    message = Message(
        sender_id=user.id,
        receiver_id=patient_profile.user_id,
        patient_id=patient_id,
        doctor_id=doctor_profile.id,
        content=content
    )
    db.session.add(message)
    db.session.commit()
    return jsonify({'msg': 'Message sent', 'message_id': message.id}), 201 