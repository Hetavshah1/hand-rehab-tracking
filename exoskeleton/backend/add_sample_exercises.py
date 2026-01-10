from app import app
from extensions import db
from models import Exercise

SAMPLES = [
    {
        'name': 'Finger Flexion - Demo',
        'description': 'Controlled finger flexion exercise with wrist stability.',
        # tiny placeholder data URI (WebM) — replace with real file in production
        'video_uri': 'data:video/webm;base64,GkXfo0AgQoaBAAAABQAAABQbG9uZwAAAA1lbWJlZGMBAAAACnZpZGVvGQAAAAAA',
        'image_uri': None
    },
    {
        'name': 'Wrist Extension - Demo',
        'description': 'Wrist extension with finger tracking for rehabilitation.',
        'video_uri': 'data:video/webm;base64,GkXfo0AgQoaBAAAABQAAABQbG9uZwAAAA1lbWJlZGMBAAAACnZpZGVvGQAAAAAB',
        'image_uri': None
    },
    {
        'name': 'Wrist Flexion - Demo',
        'description': 'Wrist flexion exercise with optical sensing support.',
        'video_uri': 'data:video/webm;base64,GkXfo0AgQoaBAAAABQAAABQbG9uZwAAAA1lbWJlZGMBAAAACnZpZGVvGQAAAAAC',
        'image_uri': None
    },
    {
        'name': 'Finger Abduction - Demo',
        'description': 'Finger abduction with exoskeleton assistance.',
        'video_uri': 'data:video/webm;base64,GkXfo0AgQoaBAAAABQAAABQbG9uZwAAAA1lbWJlZGMBAAAACnZpZGVvGQAAAAAD',
        'image_uri': None
    }
]


def add_exercises():
    with app.app_context():
        print('Adding sample exercises to DB...')
        for s in SAMPLES:
            existing = Exercise.query.filter_by(name=s['name']).first()
            if existing:
                print(f"Skipping existing exercise: {s['name']}")
                continue
            ex = Exercise(name=s['name'], description=s['description'], video_url=s['video_uri'], image_url=s['image_uri'])
            db.session.add(ex)
            print(f"Added exercise: {s['name']}")
        db.session.commit()
        print('Done.')


if __name__ == '__main__':
    add_exercises()
