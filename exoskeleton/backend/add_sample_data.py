# Add sample data to test the DoctorPatientProfile
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from extensions import db
from models import User, PatientProfile, DoctorProfile, Session, Progress, Goal
from datetime import datetime, timedelta

def add_sample_data():
    with app.app_context():
        print("🎯 Adding sample data...")
        
        # Get the existing patient and doctor
        patient_profile = PatientProfile.query.first()
        doctor_profile = DoctorProfile.query.first()
        
        if not patient_profile or not doctor_profile:
            print("❌ No patient or doctor found!")
            return
        
        print(f"✅ Using Patient ID: {patient_profile.id}")
        print(f"✅ Using Doctor ID: {doctor_profile.id}")
        
        # Add sample goals
        sample_goals = [
            Goal(
                patient_id=patient_profile.id,
                doctor_id=doctor_profile.id,
                description="Improve hand flexibility",
                metric_name="Flexibility",
                target_value="90",
                deadline=datetime.now() + timedelta(days=30),
                achieved=False
            ),
            Goal(
                patient_id=patient_profile.id,
                doctor_id=doctor_profile.id,
                description="Increase grip strength",
                metric_name="Grip Strength",
                target_value="50",
                deadline=datetime.now() + timedelta(days=45),
                achieved=False
            ),
            Goal(
                patient_id=patient_profile.id,
                doctor_id=doctor_profile.id,
                description="Reduce hand tremors",
                metric_name="Tremor Control",
                target_value="5",
                deadline=datetime.now() + timedelta(days=60),
                achieved=True
            )
        ]
        
        for goal in sample_goals:
            db.session.add(goal)
        
        print("✅ Added 3 sample goals")
        
        # Add sample sessions with progress
        sample_sessions = [
            {
                "date": datetime.now() - timedelta(days=7),
                "notes": "First therapy session - patient showed good progress",
                "progress": [
                    {"metric_name": "Flexibility", "value": "75", "goal": "90"},
                    {"metric_name": "Grip Strength", "value": "35", "goal": "50"},
                    {"metric_name": "Tremor Control", "value": "8", "goal": "5"}
                ]
            },
            {
                "date": datetime.now() - timedelta(days=3),
                "notes": "Second session - improved flexibility noted",
                "progress": [
                    {"metric_name": "Flexibility", "value": "80", "goal": "90"},
                    {"metric_name": "Grip Strength", "value": "40", "goal": "50"},
                    {"metric_name": "Tremor Control", "value": "6", "goal": "5"}
                ]
            },
            {
                "date": datetime.now(),
                "notes": "Latest session - excellent progress",
                "progress": [
                    {"metric_name": "Flexibility", "value": "85", "goal": "90"},
                    {"metric_name": "Grip Strength", "value": "45", "goal": "50"},
                    {"metric_name": "Tremor Control", "value": "4", "goal": "5"}
                ]
            }
        ]
        
        for session_data in sample_sessions:
            session = Session(
                patient_id=patient_profile.id,
                doctor_id=doctor_profile.id,
                date=session_data["date"],
                notes=session_data["notes"]
            )
            db.session.add(session)
            db.session.flush()  # Get the session ID
            
            # Add progress entries
            for progress_data in session_data["progress"]:
                progress = Progress(
                    session_id=session.id,
                    metric_name=progress_data["metric_name"],
                    value=progress_data["value"],
                    goal=progress_data["goal"]
                )
                db.session.add(progress)
        
        print("✅ Added 3 sample sessions with progress data")
        
        # Commit all changes
        db.session.commit()
        
        print("\n🎉 Sample data added successfully!")
        print("Now you can view the patient profile to see:")
        print("- ✅ Goals section with 3 goals")
        print("- ✅ Calendar with session dates")
        print("- ✅ Progress chart with data")
        print("- ✅ Session history with details")

if __name__ == "__main__":
    add_sample_data()