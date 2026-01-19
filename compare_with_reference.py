import cv2
import mediapipe as mp
import numpy as np
import pickle

from angle_utils import calculate_angle, ema_smooth

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
# Load reference data
# ----------------------------
with open("reference.pkl", "rb") as f:
    ref_data = pickle.load(f)["angles"]

ref_angles = np.array([x[1] for x in ref_data], dtype=float)

# Two anchor poses
open_pose = ref_angles[0]
closed_pose = ref_angles[-1]

# ----------------------------
# Load reference video (demo only)
# ----------------------------
ref_cap = cv2.VideoCapture("reference.mp4")
ref_frames = []
while True:
    ok, f = ref_cap.read()
    if not ok:
        break
    ref_frames.append(f)
ref_cap.release()

# ----------------------------
# Symmetric pose accuracy (FIX)
# ----------------------------
def live_pose_accuracy_strict(live_angles, open_pose, closed_pose,
                              tol_deg=15, fail_deg=40):
    """
    Strict rehabilitation-style accuracy.
    - If any finger is too wrong → 0%
    - Otherwise scaled score
    """

    # Decide which anchor we are closer to
    dist_open = np.abs(live_angles - open_pose)
    dist_closed = np.abs(live_angles - closed_pose)

    if np.mean(dist_open) < np.mean(dist_closed):
        target = open_pose
    else:
        target = closed_pose

    diff = np.abs(live_angles - target)

    # HARD FAIL
    if np.any(diff > fail_deg):
        return 0.0

    # Soft tolerance scoring
    diff_adj = np.maximum(0.0, diff - tol_deg)

    per_finger = 1.0 - (diff_adj / (fail_deg - tol_deg))
    per_finger = np.clip(per_finger, 0.0, 1.0)

    return float(np.mean(per_finger) * 100.0)


# ----------------------------
# Webcam setup
# ----------------------------
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

prev_angles = None

# Runtime states
evaluation_requested = False   # 's' pressed
evaluation_on = False          # baseline captured
baseline_pose = None

ref_idx = 0                    # reference video index

print("Controls:")
print("  s → start accuracy (baseline captured from live hand)")
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

        # Reference demo playback (independent)
        ref_frame = ref_frames[ref_idx].copy()
        ref_idx = (ref_idx + 1) % len(ref_frames)

        rgb = cv2.cvtColor(live_frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        live_angles = None
        if results.multi_hand_landmarks:
            hand = results.multi_hand_landmarks[0]
            raw_angles = get_finger_angles(hand)
            live_angles = ema_smooth(prev_angles, raw_angles)
            prev_angles = live_angles

            mp_drawing.draw_landmarks(live_frame, hand, mp_hands.HAND_CONNECTIONS)

            # Capture baseline AFTER pressing 's'
            if evaluation_requested and not evaluation_on:
                baseline_pose = live_angles.copy()
                evaluation_on = True
                evaluation_requested = False
                print("Baseline captured. Accuracy started.")

            # Show accuracy
            if evaluation_on and baseline_pose is not None:
                acc = live_pose_accuracy_strict(live_angles, baseline_pose, closed_pose)
                cv2.putText(
                    live_frame,
                    f"Accuracy: {acc:.1f}%",
                    (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1.1,
                    (0, 255, 0) if acc > 70 else (0, 0, 255),
                    3
                )

        # Waiting message
        if evaluation_requested and not evaluation_on:
            cv2.putText(
                live_frame,
                "Place hand in view to start...",
                (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.9,
                (0, 255, 255),
                2
            )

        # Display
        ref_frame = cv2.resize(
            ref_frame,
            (420, int(420 * ref_frame.shape[0] / ref_frame.shape[1]))
        )
        live_frame = cv2.resize(live_frame, (420, ref_frame.shape[0]))
        combined = np.hstack((ref_frame, live_frame))
        cv2.imshow("Reference (Left) | Live (Right)", combined)

        key = cv2.waitKey(1) & 0xFF

        if key == ord('s'):
            evaluation_requested = True
            evaluation_on = False
            baseline_pose = None
            ref_idx = 0   # restart reference demo
            print("Evaluation requested. Waiting for hand...")

        elif key == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()
