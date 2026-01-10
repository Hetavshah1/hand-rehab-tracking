from app import app
from extensions import db

with app.app_context():
    # Drop all tables and recreate them
    db.drop_all()
    db.create_all()
    print("Database tables created successfully!")
    print("You can now restart your backend server.")
