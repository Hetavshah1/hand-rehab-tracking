import cv2
import mediapipe as mp
import numpy as np
import time
import pickle
import os
from angle_utils import calculate_angle

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)

# Video writer (initialized later when recording starts)
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
video_writer = None

recording = False
angles_data = []

print("Controls: press 'r' to START/STOP recording. Press 'q' to quit.")

with mp_hands.Hands(min_detection_confidence=0.7,
                    min_tracking_confidence=0.7) as hands:
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.flip(frame, 1)
        h, w = frame.shape[:2]

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

                lm = hand_landmarks.landmark
                def pt(i): return [lm[i].x, lm[i].y, lm[i].z]

                # Calculate finger joint angles
                thumb_angle = calculate_angle(pt(1), pt(2), pt(3))
                index_angle = calculate_angle(pt(5), pt(6), pt(7))
                middle_angle = calculate_angle(pt(9), pt(10), pt(11))
                ring_angle = calculate_angle(pt(13), pt(14), pt(15))
                pinky_angle = calculate_angle(pt(17), pt(18), pt(19))

                if recording:
                    timestamp = time.time()
                    angles_data.append([timestamp, [thumb_angle, index_angle, middle_angle, ring_angle, pinky_angle]])

        # Write to video if recording
        if recording and video_writer is not None:
            video_writer.write(frame)

        cv2.putText(frame, "Press 'r' to start/stop recording, 'q' to quit",
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)
        if recording:
            cv2.putText(frame, "Recording...", (10, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

        cv2.imshow("Record Reference", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('r'):
            recording = not recording
            if recording:
                print("Recording started...")
                angles_data = []
                # Setup video writer
                video_writer = cv2.VideoWriter("reference.mp4", fourcc, 20.0, (w, h))
            else:
                print("Recording stopped. Saving data...")
                # Save angles
                with open("reference.pkl", "wb") as f:
                    pickle.dump({"angles": angles_data}, f)
                # Release video writer
                if video_writer is not None:
                    video_writer.release()
                    video_writer = None
                print("Saved: reference.pkl and reference.mp4")
        elif key == ord('q'):
            break

cap.release()
if video_writer is not None:
    video_writer.release()
cv2.destroyAllWindows()
    