import cv2
import mediapipe as mp
import numpy as np
import pickle

# graph
import matplotlib.pyplot as plt
import time

from angle_utils import (
    calculate_angle,
    ema_smooth,
    resample_sequence,
    dtw_distance
)

# ----------------------------
# Load reference data (LOCAL)
# ----------------------------
with open("reference.pkl", "rb") as f:
    ref_data = pickle.load(f)["angles"]

ref_angles = np.array([x[1] for x in ref_data], dtype=float)

open_pose = ref_angles[0]
closed_pose = ref_angles[-1]

# ----------------------------
# Load reference video (LOCAL)
# ----------------------------
ref_cap = cv2.VideoCapture("reference.mp4")
if not ref_cap.isOpened():
    raise RuntimeError("Could not open reference.mp4")

ref_frames = []
while True:
    ok, frame = ref_cap.read()
    if not ok:
        break
    ref_frames.append(frame)
ref_cap.release()

if len(ref_frames) == 0:
    raise RuntimeError("Reference video contains no frames")

# ----------------------------
# Live Similarity Graph Setup
# ----------------------------
plt.ion()

fig, ax = plt.subplots()
line, = ax.plot([], [], lw=2)

ax.set_title("Live Similarity vs Time")
ax.set_xlabel("Time (seconds)")
ax.set_ylabel("Similarity (%)")
ax.set_ylim(0, 100)
ax.set_xlim(0, 10)
ax.grid(True)

start_time = None
time_values = []
similarity_values = []

# ----------------------------
# MediaPipe setup
# ----------------------------
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

def get_finger_angles(hand_landmarks):
    lm = hand_landmarks.landmark
    def pt(i): return [lm[i].x, lm[i].y, lm[i].z]
    return np.array([
        calculate_angle(pt(1), pt(2), pt(3)),
        calculate_angle(pt(5), pt(6), pt(7)),
        calculate_angle(pt(9), pt(10), pt(11)),
        calculate_angle(pt(13), pt(14), pt(15)),
        calculate_angle(pt(17), pt(18), pt(19))
    ], dtype=float)

# ----------------------------
# Soft-penalty pose accuracy
# ----------------------------
def live_pose_accuracy_soft(
    live_angles,
    open_pose,
    closed_pose,
    tol_deg=15,
    fail_deg=55
):
    dist_open = np.abs(live_angles - open_pose)
    dist_closed = np.abs(live_angles - closed_pose)

    target = open_pose if np.mean(dist_open) < np.mean(dist_closed) else closed_pose
    diff = np.abs(live_angles - target)

    diff_adj = np.maximum(0.0, diff - tol_deg)
    per_finger = 1.0 - (diff_adj / (fail_deg - tol_deg))
    per_finger = np.clip(per_finger, 0.0, 1.0)

    penalty = np.clip((diff - fail_deg) / fail_deg, 0.0, 1.0)
    penalty_factor = 1.0 - np.max(penalty)

    return float(np.mean(per_finger) * penalty_factor * 100.0)

# ----------------------------
# Webcam setup
# ----------------------------
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

prev_angles = None
prev_score = None
score_alpha = 0.7

evaluation_on = False
ref_idx = 0

# 🔹 Buffers for DTW
live_sequence = []
reference_sequence = []

print("Controls:")
print("  s → start similarity score evaluation")
print("  q → quit")

with mp_hands.Hands(
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6,
    max_num_hands=1
) as hands:

    while True:
        ok, live_frame = cap.read()
        if not ok:
            break

        live_frame = cv2.flip(live_frame, 1)

        # Reference video playback
        ref_frame = ref_frames[ref_idx].copy()
        ref_idx = (ref_idx + 1) % len(ref_frames)

        rgb = cv2.cvtColor(live_frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        if results.multi_hand_landmarks:
            hand = results.multi_hand_landmarks[0]
            raw_angles = get_finger_angles(hand)
            live_angles = ema_smooth(prev_angles, raw_angles)
            prev_angles = live_angles

            mp_drawing.draw_landmarks(
                live_frame,
                hand,
                mp_hands.HAND_CONNECTIONS
            )

            if evaluation_on:
                # Store sequences for DTW
                live_sequence.append(live_angles.copy())
                reference_sequence.append(
                    ref_angles[ref_idx % len(ref_angles)].copy()
                )

                raw_score = live_pose_accuracy_soft(
                    live_angles,
                    open_pose,
                    closed_pose
                )

                if prev_score is None:
                    smooth_score = raw_score
                else:
                    smooth_score = score_alpha * raw_score + (1 - score_alpha) * prev_score

                prev_score = smooth_score

                # -------- GRAPH UPDATE --------
                if start_time is None:
                    start_time = time.time()

                elapsed = time.time() - start_time
                time_values.append(elapsed)
                similarity_values.append(smooth_score)

                line.set_xdata(time_values)
                line.set_ydata(similarity_values)
                ax.set_xlim(0, max(10, elapsed + 1))

                fig.canvas.draw()
                fig.canvas.flush_events()
                # ------------------------------

                cv2.putText(
                    live_frame,
                    f"Similarity: {smooth_score:.1f}%",
                    (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1.1,
                    (0, 255, 0) if smooth_score > 70 else (0, 0, 255),
                    3
                )

        ref_frame = cv2.resize(
            ref_frame,
            (420, int(420 * ref_frame.shape[0] / ref_frame.shape[1]))
        )
        live_frame = cv2.resize(live_frame, (420, ref_frame.shape[0]))
        cv2.imshow("Reference (Left) | Live (Right)", np.hstack((ref_frame, live_frame)))

        key = cv2.waitKey(1) & 0xFF

        if key == ord('s'):
            evaluation_on = True
            prev_score = None
            ref_idx = 0

            live_sequence.clear()
            reference_sequence.clear()

            start_time = None
            time_values.clear()
            similarity_values.clear()
            line.set_xdata([])
            line.set_ydata([])
            ax.set_xlim(0, 10)

            print("Similarity evaluation started")

        elif key == ord('q'):
            # -------- FINAL DTW SCORE --------
            if evaluation_on and len(live_sequence) > 5:
                live_seq = np.array(live_sequence)
                ref_seq = np.array(reference_sequence)

                target_len = min(len(live_seq), len(ref_seq))
                live_rs = resample_sequence(live_seq, target_len)
                ref_rs = resample_sequence(ref_seq, target_len)

                dist = dtw_distance(live_rs, ref_rs)

                D = live_rs.shape[1]  # 5 fingers
                max_possible = target_len * D * 180.0
                overall_similarity = max(
                    0.0, 100.0 * (1.0 - dist / max_possible)
                )

                print("\n==============================")
                print(f"Overall Exercise Similarity (DTW): {overall_similarity:.2f}%")
                print("==============================\n")

            break

cap.release()
cv2.destroyAllWindows()
plt.ioff()
plt.close()
