from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'doctor' or 'patient'
    #patient_profile = db.relationship('PatientProfile', backref='user', uselist=False)
    doctor_profile = db.relationship('DoctorProfile', backref='user', uselist=False)

'''class PatientProfile(db.Model):
    __tablename__ = "patient_profiles"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    age = db.Column(db.Integer)
    diagnosis = db.Column(db.String(200))
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor_profiles.id'))
    sessions = db.relationship('Session', backref='patient', lazy=True) '''

class DoctorProfile(db.Model):
    __tablename__ = "doctor_profiles"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    specialization = db.Column(db.String(100))
    #patients = db.relationship('PatientProfile', backref='doctor', lazy=True)
   # sessions = db.relationship('Session', backref='doctor', lazy=True)
"""
class Session(db.Model):
    __tablename__ = "session"
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient_profiles.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor_profiles.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)
    notes_file = db.Column(db.String(255))  # Path to uploaded file
    progresses = db.relationship('Progress', backref='session', lazy=True)

class Progress(db.Model):
    __tablename__ = "progress"
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('session.id'), nullable=False)
    metric_name = db.Column(db.String(100), nullable=False)  # e.g., 'range_of_motion', 'repetitions'
    value = db.Column(db.Float, nullable=False)
    goal = db.Column(db.Float) 

class Goal(db.Model):
    __tablename__ = "goal"
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient_profiles.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor_profiles.id'), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    target_value = db.Column(db.Float)
    metric_name = db.Column(db.String(100))
    deadline = db.Column(db.Date)
    achieved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

PatientProfile.goals = db.relationship('Goal', backref='patient', lazy=True)
DoctorProfile.goals = db.relationship('Goal', backref='doctor', lazy=True) 
"""

class Exercise(db.Model):
    __tablename__ = "exercises"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)

"""
class AssignedExercise(db.Model):
    __tablename__ = "exercise_comparisons"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient_profiles.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor_profiles.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False)
    assigned_date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)

PatientProfile.assigned_exercises = db.relationship('AssignedExercise', backref='patient', lazy=True)
DoctorProfile.assigned_exercises = db.relationship('AssignedExercise', backref='doctor', lazy=True)
Exercise.assigned = db.relationship('AssignedExercise', backref='exercise', lazy=True) 

class Message(db.Model):
    __tablename__ = "message"
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient_profile.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor_profile.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

User.sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy=True)
User.received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver', lazy=True)
PatientProfile.messages = db.relationship('Message', backref='patient', lazy=True)
DoctorProfile.messages = db.relationship('Message', backref='doctor', lazy=True) 

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(100))
    target_type = db.Column(db.String(100))
    target_id = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text)

class ConsentForm(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient_profile.id'), nullable=False)
    signed = db.Column(db.Boolean, default=False)
    signed_at = db.Column(db.DateTime)
    content = db.Column(db.Text)
    patient_name = db.Column(db.String(100))
    patient_signature = db.Column(db.String(255))

PatientProfile.consent_forms = db.relationship('ConsentForm', backref='patient', lazy=True)

# Computer Vision Models
class VideoCapture(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient_profile.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('session.id'), nullable=True)
    video_file_path = db.Column(db.String(500), nullable=False)  # Path to stored video
    video_blob = db.Column(db.LargeBinary, nullable=True)  # Optional: store video as binary
    duration_seconds = db.Column(db.Float)
    file_size_bytes = db.Column(db.Integer)
    capture_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    camera_settings = db.Column(db.Text)  # JSON string of camera config
    processing_status = db.Column(db.String(50), default='pending')  # pending, processing, completed, failed

class MovementAnalysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    video_capture_id = db.Column(db.Integer, db.ForeignKey('video_capture.id'), nullable=False)
    frame_number = db.Column(db.Integer, nullable=False)
    timestamp_seconds = db.Column(db.Float, nullable=False)
    
    # Joint positions (x, y coordinates)
    joint_positions = db.Column(db.Text)  # JSON: {"wrist": [x,y], "elbow": [x,y], "shoulder": [x,y]}
    
    # Movement metrics
    range_of_motion = db.Column(db.Float)  # Degrees
    movement_speed = db.Column(db.Float)   # Pixels per second
    movement_smoothness = db.Column(db.Float)  # Jerk metric
    joint_angles = db.Column(db.Text)      # JSON: {"elbow_angle": 45, "shoulder_angle": 30}
    
    # Analysis confidence
    detection_confidence = db.Column(db.Float)  # 0-1 confidence score
    processing_timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class ExercisePerformance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    video_capture_id = db.Column(db.Integer, db.ForeignKey('video_capture.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercise.id'), nullable=True)
    
    # Performance metrics
    repetitions_completed = db.Column(db.Integer)
    correct_form_percentage = db.Column(db.Float)  # 0-100%
    average_range_of_motion = db.Column(db.Float)
    exercise_duration_seconds = db.Column(db.Float)
    fatigue_indicators = db.Column(db.Text)  # JSON: {"tremor": 0.2, "speed_decrease": 0.15}
    
    # AI Analysis results
    form_analysis = db.Column(db.Text)  # JSON: detailed form analysis
    improvement_suggestions = db.Column(db.Text)  # AI-generated suggestions
    overall_score = db.Column(db.Float)  # 0-100 overall performance score
    
    analysis_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
"""
"""
# Relationships
PatientProfile.video_captures = db.relationship('VideoCapture', backref='patient', lazy=True)
Session.video_captures = db.relationship('VideoCapture', backref='session', lazy=True)
VideoCapture.movement_analyses = db.relationship('MovementAnalysis', backref='video_capture', lazy=True)
VideoCapture.exercise_performances = db.relationship('ExercisePerformance', backref='video_capture', lazy=True)
Exercise.exercise_performances = db.relationship('ExercisePerformance', backref='exercise', lazy=True) 
"""