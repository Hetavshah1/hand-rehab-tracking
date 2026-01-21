import pickle
import cv2
import numpy as np
from db import get_connection

def load_exercise(exercise_code):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT id, reference_video_path, reference_angle_path
        FROM exercises
        WHERE exercise_code = %s
        """,
        (exercise_code,)
    )

    row = cur.fetchone()
    cur.close()
    conn.close()

    if row is None:
        raise ValueError(f"Exercise '{exercise_code}' not found in database")

    exercise_id, video_path, angle_path = row

    # Load reference angles
    with open(angle_path, "rb") as f:
        ref_data = pickle.load(f)["angles"]
    ref_angles = np.array([x[1] for x in ref_data], dtype=float)

    # Load reference video
    ref_cap = cv2.VideoCapture(video_path)
    if not ref_cap.isOpened():
        raise RuntimeError("Could not open reference video")

    return exercise_id, ref_angles, ref_cap
