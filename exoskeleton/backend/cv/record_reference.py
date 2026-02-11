import cv2
import mediapipe as mp
import time
import pickle
import os
from .angle_utils import calculate_angle

class HandRecorder:
    def __init__(self, output_dir):
        self.cap = cv2.VideoCapture(0)
        self.recording = False
        self.angles_data = []
        self.video_writer = None
        self.output_dir = output_dir

        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )

    def start(self, filename_base):
        self.recording = True
        self.angles_data = []

        self.video_path = os.path.join(self.output_dir, f"{filename_base}.mp4")
        self.pkl_path = os.path.join(self.output_dir, f"{filename_base}.pkl")

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        ret, frame = self.cap.read()
        h, w = frame.shape[:2]
        self.video_writer = cv2.VideoWriter(self.video_path, fourcc, 20.0, (w, h))

    def capture_frame(self):
        if not self.recording:
            return

        ret, frame = self.cap.read()
        if not ret:
            return

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb)

        if results.multi_hand_landmarks:
            lm = results.multi_hand_landmarks[0].landmark

            def pt(i): return [lm[i].x, lm[i].y, lm[i].z]

            angles = [
                calculate_angle(pt(1), pt(2), pt(3)),
                calculate_angle(pt(5), pt(6), pt(7)),
                calculate_angle(pt(9), pt(10), pt(11)),
                calculate_angle(pt(13), pt(14), pt(15)),
                calculate_angle(pt(17), pt(18), pt(19)),
            ]

            self.angles_data.append([time.time(), angles])

        self.video_writer.write(frame)

    def stop(self):
        self.recording = False

        with open(self.pkl_path, "wb") as f:
            pickle.dump({"angles": self.angles_data}, f)

        self.video_writer.release()
        self.cap.release()

        return self.video_path, self.pkl_path