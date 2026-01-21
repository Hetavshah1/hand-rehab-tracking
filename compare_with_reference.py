import cv2
import mediapipe as mp
import numpy as np
import pickle
#dtw 
from angle_utils import dtw_distance
from collections import deque


from angle_utils import calculate_angle, ema_smooth

# ----------------------------
# Load reference data (LOCAL)
# ----------------------------
with open("reference.pkl", "rb") as f:
    ref_data = pickle.load(f)["angles"]

ref_angles = np.array([x[1] for x in ref_data], dtype=float)

# Anchor poses (start & end of exercise)
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
# MediaPipe setup
# ----------------------------
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

def get_finger_angles(hand_landmarks):
    lm = hand_landmarks.landmark
    def pt(i): return [lm[i].x, lm[i].y, lm[i].z]
    return np.array([
        calculate_angle(pt(1), pt(2), pt(3)),    # Thumb
        calculate_angle(pt(5), pt(6), pt(7)),    # Index
        calculate_angle(pt(9), pt(10), pt(11)),  # Middle
        calculate_angle(pt(13), pt(14), pt(15)), # Ring
        calculate_angle(pt(17), pt(18), pt(19))  # Pinky
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
    # Decide which anchor pose is closer
    dist_open = np.abs(live_angles - open_pose)
    dist_closed = np.abs(live_angles - closed_pose)

    target = open_pose if np.mean(dist_open) < np.mean(dist_closed) else closed_pose
    diff = np.abs(live_angles - target)

    # Soft tolerance
    diff_adj = np.maximum(0.0, diff - tol_deg)
    per_finger = 1.0 - (diff_adj / (fail_deg - tol_deg))
    per_finger = np.clip(per_finger, 0.0, 1.0)

    # Soft penalty (no hard zero)
    penalty = np.clip((diff - fail_deg) / fail_deg, 0.0, 1.0)
    penalty_factor = 1.0 - np.max(penalty)

    score = np.mean(per_finger) * penalty_factor
    return float(score * 100.0)

# ----------------------------
# Webcam setup
# ----------------------------
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

prev_angles = None
prev_score = None
score_alpha = 0.7  # EMA smoothing for score

evaluation_on = False
ref_idx = 0

print("Controls:")
print("  s → start smilarity score evaluation")
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

        # Reference video playback (loop)
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
                raw_score = live_pose_accuracy_soft(
                    live_angles,
                    open_pose,
                    closed_pose
                )

                if prev_score is None:
                    smooth_score = raw_score
                else:
                    smooth_score = (
                        score_alpha * raw_score
                        + (1 - score_alpha) * prev_score
                    )

                prev_score = smooth_score

                cv2.putText(
                    live_frame,
                    f"Similarity: {smooth_score:.1f}%",
                    (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1.1,
                    (0, 255, 0) if smooth_score > 70 else (0, 0, 255),
                    3
                )

        # Display side-by-side
        ref_frame = cv2.resize(
            ref_frame,
            (420, int(420 * ref_frame.shape[0] / ref_frame.shape[1]))
        )
        live_frame = cv2.resize(live_frame, (420, ref_frame.shape[0]))
        combined = np.hstack((ref_frame, live_frame))
        cv2.imshow("Reference (Left) | Live (Right)", combined)

        key = cv2.waitKey(1) & 0xFF

        if key == ord('s'):
            evaluation_on = True
            prev_score = None
            ref_idx = 0
            print("Similarity score")

        elif key == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()
