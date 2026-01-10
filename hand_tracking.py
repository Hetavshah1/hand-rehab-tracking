import cv2
import mediapipe as mp
import numpy as np
import csv
import time
import matplotlib.pyplot as plt
from collections import deque
from angle_utils import calculate_angle

# Setup
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# CSV File
csv_file = open("captured_data.csv", mode='w', newline='')
csv_writer = csv.writer(csv_file)
csv_writer.writerow(['Timestamp', 'Thumb_Angle', 'Index_Angle', 'Middle_Angle', 'Ring_Angle', 'Pinky_Angle', 'Gesture'])

# Graph Buffers
window_size = 100  # frames to keep in the live graph
buffers = {
    "Thumb": deque(maxlen=window_size),
    "Index": deque(maxlen=window_size),
    "Middle": deque(maxlen=window_size),
    "Ring": deque(maxlen=window_size),
    "Pinky": deque(maxlen=window_size),
}

# Plot Setup
plt.ion()
fig, ax = plt.subplots()
lines = {}
colors = ["blue", "green", "red", "purple", "orange"]

for i, finger in enumerate(buffers.keys()):
    lines[finger], = ax.plot([], [], label=finger, color=colors[i])

ax.set_ylim(0, 180)
ax.set_xlim(0, window_size)
ax.legend()
ax.set_title("Real-time Finger Joint Angles")
ax.set_ylabel("Angle (°)")
ax.set_xlabel("Frame")

# Helper for gesture detection
def detect_gesture(thumb, index, middle, ring, pinky):
    if all(angle < 40 for angle in [thumb, index, middle, ring, pinky]):
        return "Fist"
    elif index < 40 and middle < 40 and ring > 70 and pinky > 70:
        return "Peace"
    elif thumb < 40 and all(angle > 70 for angle in [index, middle, ring, pinky]):
        return "Thumbs Up"
    else:
        return "Neutral"

# Camera
cap = cv2.VideoCapture(0)
with mp_hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7) as hands:
    while cap.isOpened():
        success, image = cap.read()
        if not success:
            break

        image = cv2.flip(image, 1)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(image_rgb)

        gesture = "None"

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                lm = hand_landmarks.landmark

                def lm_point(id):
                    return [lm[id].x, lm[id].y, lm[id].z]

                # Angles
                thumb_angle = calculate_angle(lm_point(1), lm_point(2), lm_point(3))
                index_angle = calculate_angle(lm_point(5), lm_point(6), lm_point(7))
                middle_angle = calculate_angle(lm_point(9), lm_point(10), lm_point(11))
                ring_angle = calculate_angle(lm_point(13), lm_point(14), lm_point(15))
                pinky_angle = calculate_angle(lm_point(17), lm_point(18), lm_point(19))

                # Detect gesture
                gesture = detect_gesture(thumb_angle, index_angle, middle_angle, ring_angle, pinky_angle)

                # Save to CSV
                timestamp = time.time()
                csv_writer.writerow([timestamp, thumb_angle, index_angle, middle_angle, ring_angle, pinky_angle, gesture])

                # Draw
                mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)

                # Show angles + gesture
                cv2.putText(image, f'Gesture: {gesture}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

                # Update buffers
                buffers["Thumb"].append(thumb_angle)
                buffers["Index"].append(index_angle)
                buffers["Middle"].append(middle_angle)
                buffers["Ring"].append(ring_angle)
                buffers["Pinky"].append(pinky_angle)

                # Update plots
                for i, (finger, buf) in enumerate(buffers.items()):
                    lines[finger].set_ydata(list(buf))
                    lines[finger].set_xdata(list(range(len(buf))))

                ax.relim()
                ax.autoscale_view(True, True, True)
                fig.canvas.draw()
                fig.canvas.flush_events()

        cv2.imshow('Hand Tracking', image)
        if cv2.waitKey(1) & 0xFF == 27:  # ESC to exit
            break

cap.release()
cv2.destroyAllWindows()
csv_file.close()
