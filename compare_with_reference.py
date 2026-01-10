# compare_with_reference_strong.py
import cv2
import mediapipe as mp
import numpy as np
import pickle
import argparse
import time
from collections import deque
import csv

# try to import helpers from angle_utils if available, else define local fallbacks
try:
    from angle_utils import calculate_angle, resample_sequence, dtw_distance, ema_smooth
except Exception:
    from angle_utils import calculate_angle  # must exist

    def resample_sequence(seq, target_len):
        seq = np.array(seq, dtype=float)
        if seq.ndim == 1:
            seq = seq[:, None]
        N, D = seq.shape
        if N == 0:
            return np.zeros((target_len, D))
        if N == target_len:
            return seq.copy()
        x_old = np.linspace(0, 1, N)
        x_new = np.linspace(0, 1, target_len)
        res = np.zeros((target_len, D))
        for d in range(D):
            res[:, d] = np.interp(x_new, x_old, seq[:, d])
        return res

    def dtw_distance(s1, s2):
        # s1: (N,D), s2: (M,D)
        s1 = np.array(s1, dtype=float)
        s2 = np.array(s2, dtype=float)
        N, D = s1.shape
        M = s2.shape[0]
        cost = np.full((N+1, M+1), np.inf, dtype=float)
        cost[0,0] = 0.0
        for i in range(1, N+1):
            for j in range(1, M+1):
                d = np.linalg.norm(s1[i-1] - s2[j-1])
                cost[i,j] = d + min(cost[i-1,j], cost[i,j-1], cost[i-1,j-1])
        return float(cost[N, M])

    def ema_smooth(prev, current, alpha=0.6):
        if prev is None:
            return np.array(current, dtype=float)
        return alpha * np.array(current, dtype=float) + (1 - alpha) * np.array(prev, dtype=float)

# ----------------------------
# Utility functions
# ----------------------------
def vector_to_percent(dist, length, dims=1):
    max_possible = length * dims * 180.0
    sim = max(0.0, 100.0 * (1.0 - (dist / (max_possible + 1e-9))))
    return sim

def draw_bar(img, x, y, w, h, pct, color=(0,200,0)):
    cv2.rectangle(img, (x,y), (x+w, y+h), (50,50,50), -1)
    fill = int((pct/100.0)*w)
    cv2.rectangle(img, (x,y), (x+fill, y+h), color, -1)
    cv2.rectangle(img, (x,y), (x+w, y+h), (200,200,200), 1)

# ----------------------------
# Finger angle extraction
# ----------------------------
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

def get_finger_angles_from_landmarks(hand_landmarks):
    lm = hand_landmarks.landmark
    def pt(i): return [lm[i].x, lm[i].y, lm[i].z]
    return np.array([
        calculate_angle(pt(1), pt(2), pt(3)),   # Thumb
        calculate_angle(pt(5), pt(6), pt(7)),   # Index
        calculate_angle(pt(9), pt(10), pt(11)), # Middle
        calculate_angle(pt(13), pt(14), pt(15)),# Ring
        calculate_angle(pt(17), pt(18), pt(19)) # Pinky
    ], dtype=float)

# ----------------------------
# Command-line args
# ----------------------------
parser = argparse.ArgumentParser()
parser.add_argument("--ref", required=True, help="Path to reference angles file (.pkl or .json)")
parser.add_argument("--ref_video", required=True, help="Path to reference video file (mp4/avi)")
parser.add_argument("--buffer", type=int, default=60, help="Sliding buffer length in frames (default 60)")
parser.add_argument("--calib_frames", type=int, default=12, help="Calibration frames collected after pressing r")
parser.add_argument("--smooth_alpha", type=float, default=0.6, help="EMA smoothing alpha")
parser.add_argument("--log", default="comparison_strong_log.csv", help="CSV log path")
args = parser.parse_args()

# ----------------------------
# Load reference angles
# ----------------------------
def load_ref_angles(path):
    with open(path, "rb") as f:
        data = pickle.load(f)
    # try to support older structure: list of (timestamp, angles) or {"angles": ...} or {"frames": ...}
    if isinstance(data, dict):
        if "angles" in data:
            raw = data["angles"]
        elif "frames" in data:
            raw = data["frames"]
        else:
            # maybe the dict itself is mapping frames -> angles ...
            raw = []
            for v in data.values():
                raw.append(v)
    else:
        raw = data

    seq = []
    for item in raw:
        if isinstance(item, (list,tuple)) and len(item) >= 2 and isinstance(item[1], (list,tuple)):
            seq.append(item[1])
        elif isinstance(item, (list,tuple)) and len(item) == 5:
            seq.append(item)
    return np.array(seq, dtype=float)

ref_angles_raw = load_ref_angles(args.ref)
if ref_angles_raw.size == 0:
    raise RuntimeError("Reference angles could not be parsed or is empty.")
# ----------------------------
# Load reference video and frames
# ----------------------------
ref_cap = cv2.VideoCapture(args.ref_video)
if not ref_cap.isOpened():
    raise RuntimeError(f"Cannot open reference video: {args.ref_video}")

ref_frames = []
# limit size to avoid huge memory use; but usually reference short
while True:
    ok, f = ref_cap.read()
    if not ok:
        break
    ref_frames.append(f)
ref_cap.release()
if len(ref_frames) == 0:
    raise RuntimeError("Reference video has no frames or could not be read.")

# resize frames to small size for smooth playback, compute target size
target_w = 420
target_h = int(target_w * (ref_frames[0].shape[0] / ref_frames[0].shape[1]))
for i in range(len(ref_frames)):
    ref_frames[i] = cv2.resize(ref_frames[i], (target_w, target_h))

# align reference-angle sequence to reference-frame count by resampling
ref_angles_frames = resample_sequence(ref_angles_raw, len(ref_frames))  # shape (F,5)

# ----------------------------
# Prepare runtime structures
# ----------------------------
live_cap = cv2.VideoCapture(0)
if not live_cap.isOpened():
    raise RuntimeError("Cannot open webcam (0)")

# reduce webcam resolution for speed (optional)
live_cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
live_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

buffer_len = args.buffer
buffers = deque(maxlen=buffer_len)  # will store arrays shape (5,)
prev_smoothed = None
comparison_on = False
calibrated = False
calib_samples = []

# CSV logger
csv_f = open(args.log, "w", newline="")
csv_writer = csv.writer(csv_f)
csv_writer.writerow(["timestamp", "final_score", "seq_sim", "inst_sim",
                     "dtw_multi", "per_thumb", "per_index", "per_middle", "per_ring", "per_pinky"])

frame_idx = 0
start_time = time.time()

print("Loaded reference:", len(ref_frames), "video frames;", ref_angles_raw.shape[0], "angle frames")
print("Controls: press 'r' to start/stop comparison (will run quick calibration), press 'q' to quit.")

with mp_hands.Hands(min_detection_confidence=0.6, min_tracking_confidence=0.6, max_num_hands=1) as hands:
    while True:
        ok, live_frame = live_cap.read()
        if not ok:
            break
        live_frame = cv2.flip(live_frame, 1)
        h_live, w_live = live_frame.shape[:2]

        # get the reference frame (loop)
        ref_frame = ref_frames[frame_idx % len(ref_frames)].copy()

        # process live frame
        rgb = cv2.cvtColor(live_frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        live_angles = None
        if results.multi_hand_landmarks:
            live_angles_raw = get_finger_angles_from_landmarks(results.multi_hand_landmarks[0])
            smoothed = ema_smooth(prev_smoothed, live_angles_raw, alpha=args.smooth_alpha)
            prev_smoothed = smoothed
            live_angles = smoothed  # np.array shape (5,)
            mp_drawing.draw_landmarks(live_frame, results.multi_hand_landmarks[0], mp_hands.HAND_CONNECTIONS)

        # If comparison is active handle calibration then buffering & scoring
        if comparison_on:
            if not calibrated:
                # collect baseline frames
                if live_angles is not None:
                    calib_samples.append(live_angles.copy())
                cv2.putText(live_frame, f"Calibrating... {len(calib_samples)}/{args.calib_frames}", (10,30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,255), 2)
                if len(calib_samples) >= args.calib_frames:
                    live_baseline = np.mean(np.stack(calib_samples), axis=0)
                    calibrated = True
                    buffers.clear()
                    print("Calibration done. live baseline:", np.round(live_baseline,1))
            else:
                # append adjusted live angle into buffer
                if live_angles is not None:
                    adjusted_live = live_angles - live_baseline
                    buffers.append(adjusted_live.copy())

                # compute scoring when we have a full buffer
                if len(buffers) == buffer_len:
                    buf_arr = np.stack(list(buffers), axis=0)  # (buffer_len,5)

                    # choose aligned reference window ending at current frame_idx
                    end = frame_idx % len(ref_frames)
                    start = end - buffer_len + 1
                    if start < 0:
                        # pad by repeating first frame
                        idxs = np.arange(start, end+1)
                        idxs = np.mod(idxs, len(ref_frames))
                    else:
                        idxs = np.arange(start, end+1)
                    ref_window = ref_angles_frames[idxs]  # (buffer_len,5)

                    # subtract ref baseline (first of window) and live baseline already subtracted
                    ref_baseline_local = ref_window[0].copy()
                    ref_window_adj = ref_window - ref_baseline_local

                    # multi-dimensional DTW distance & similarity
                    dist_multi = dtw_distance(buf_arr, ref_window_adj)
                    seq_sim = vector_to_percent(dist_multi, buffer_len, dims=5)

                    # per-finger DTW and similarity
                    per_sims = []
                    per_dists = []
                    for d in range(5):
                        live_d = buf_arr[:, d].reshape(-1,1)
                        ref_d = ref_window_adj[:, d].reshape(-1,1)
                        dd = dtw_distance(live_d, ref_d)
                        per_dists.append(dd)
                        per_sims.append(vector_to_percent(dd, buffer_len, dims=1))

                    # instantaneous similarity (current frame)
                    inst_sim = 0.0
                    if live_angles is not None:
                        ref_current = ref_angles_frames[end]
                        # subtract baselines
                        ref_current_adj = ref_current - ref_baseline_local
                        diff = np.abs((live_angles - live_baseline) - ref_current_adj)  # difference in adjusted angles
                        per_inst = np.clip(100.0 * (1.0 - diff / 180.0), 0, 100)
                        inst_sim = float(np.mean(per_inst))
                    # combine sequence + instant
                    final_score = 0.7 * seq_sim + 0.3 * inst_sim

                    # log
                    csv_writer.writerow([time.time(), final_score, seq_sim, inst_sim, dist_multi] + per_sims)
                    csv_f.flush()

                    # build overlay showing per-finger bars and final score
                    overlay = live_frame.copy()
                    start_x = overlay.shape[1] - 260
                    start_y = 80
                    bar_w = 200
                    bar_h = 18
                    labels = ["Thumb","Index","Middle","Ring","Pinky"]
                    colors = [(200,100,50),(50,200,50),(50,50,200),(150,50,200),(50,150,200)]
                    for i, lab in enumerate(labels):
                        pct = per_sims[i]
                        color = colors[i] if pct > 60 else (0,0,200)
                        draw_bar(overlay, start_x, start_y + i*35, bar_w, bar_h, pct, color=color)
                        cv2.putText(overlay, f"{lab}: {pct:.1f}%", (start_x - 140, start_y + i*35 + bar_h - 2),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 1)

                    cv2.putText(overlay, f"SeqSim: {seq_sim:.1f}% InstSim: {inst_sim:.1f}%",
                                (10, overlay.shape[0]-50), cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                                (0,255,0) if final_score > 70 else (0,140,255), 2)
                    cv2.putText(overlay, f"Final: {final_score:.1f}%", (10, overlay.shape[0]-25),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0,255,0) if final_score > 70 else (0,140,255), 2)

                    display_frame = overlay
                else:
                    # buffer still filling
                    display_frame = live_frame.copy()
                    cv2.putText(display_frame, f"Filling buffer {len(buffers)}/{buffer_len}", (10,30),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,255), 2)
        else:
            # comparison not on
            calibrated = False
            calib_samples = []
            display_frame = live_frame.copy()

        # annotate reference frame
        cv2.putText(ref_frame, "Reference (loop)", (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,200,255), 2)

        # resize live display to match ref frame height
        live_h, live_w = display_frame.shape[:2]
        live_resized = cv2.resize(display_frame, (target_w, target_h))

        combined = np.hstack((ref_frame, live_resized))
        cv2.imshow("Reference (left)  |  Live (right)", combined)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('r'):
            comparison_on = not comparison_on
            if comparison_on:
                print("Comparison ON -> starting calibration.")
                calibrated = False
                calib_samples = []
                buffers.clear()
                prev_smoothed = None
            else:
                print("Comparison OFF.")
        elif key == ord('q'):
            break

        frame_idx += 1

# cleanup
live_cap.release()
csv_f.close()
cv2.destroyAllWindows()
