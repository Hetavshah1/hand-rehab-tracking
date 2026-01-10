from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models import User, PatientProfile, DoctorProfile

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    age = data.get('age')
    if not all([name, email, password, role]):
        return jsonify({'msg': 'Missing fields'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'Email already exists'}), 400
    password_hash = generate_password_hash(password)
    user = User(name=name, email=email, password_hash=password_hash, role=role)
    db.session.add(user)
    db.session.commit()
    if role == 'patient':
        profile = PatientProfile(user_id=user.id)
        if age:
            profile.age = age
        db.session.add(profile)
    elif role == 'doctor':
        profile = DoctorProfile(user_id=user.id)
        db.session.add(profile)
    db.session.commit()
    return jsonify({'msg': 'User created'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'msg': 'Invalid credentials'}), 401
    access_token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': access_token, 'role': user.role}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    return jsonify({'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role}) 