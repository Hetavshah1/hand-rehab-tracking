# Simple test to check if backend is working
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from extensions import db
from models import User, PatientProfile, DoctorProfile, Session, Progress, Goal

def check_database():
    with app.app_context():
        print("🔍 Checking database contents...")
        
        # Check users
        users = User.query.all()
        print(f"📊 Total Users: {len(users)}")
        for user in users:
            print(f"  - {user.name} ({user.email}) - Role: {user.role}")
        
        # Check patient profiles
        patients = PatientProfile.query.all()
        print(f"👥 Total Patients: {len(patients)}")
        for patient in patients:
            user = User.query.get(patient.user_id)
            print(f"  - Patient ID: {patient.id}, User: {user.name if user else 'Unknown'}")
            print(f"    Age: {patient.age}, Diagnosis: {patient.diagnosis}")
        
        # Check doctor profiles
        doctors = DoctorProfile.query.all()
        print(f"👨‍⚕️ Total Doctors: {len(doctors)}")
        for doctor in doctors:
            user = User.query.get(doctor.user_id)
            print(f"  - Doctor ID: {doctor.id}, User: {user.name if user else 'Unknown'}")
        
        # Check sessions
        sessions = Session.query.all()
        print(f"📅 Total Sessions: {len(sessions)}")
        for session in sessions:
            print(f"  - Session ID: {session.id}, Patient ID: {session.patient_id}")
            print(f"    Date: {session.date}, Notes: {session.notes}")
            
            # Check progress for this session
            progress_count = len(session.progresses)
            print(f"    Progress entries: {progress_count}")
            for progress in session.progresses:
                print(f"      - {progress.metric_name}: {progress.value} (Goal: {progress.goal})")
        
        # Check goals
        goals = Goal.query.all()
        print(f"🎯 Total Goals: {len(goals)}")
        for goal in goals:
            print(f"  - Goal ID: {goal.id}, Patient ID: {goal.patient_id}")
            print(f"    Description: {goal.description}")
            print(f"    Metric: {goal.metric_name}, Target: {goal.target_value}")
            print(f"    Achieved: {goal.achieved}")

if __name__ == "__main__":
    check_database()
