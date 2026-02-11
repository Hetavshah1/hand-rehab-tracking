# angle_utils.py
import numpy as np

def calculate_angle(a, b, c):
    """
    a, b, c are 3D points [x,y,z] or 2D [x,y].
    Returns angle at b (in degrees) between BA and BC.
    """
    a = np.array(a, dtype=float)
    b = np.array(b, dtype=float)
    c = np.array(c, dtype=float)

    ba = a - b
    bc = c - b
    # guard
    denom = (np.linalg.norm(ba) * np.linalg.norm(bc))
    if denom == 0:
        return 0.0
    cosine = np.dot(ba, bc) / denom
    cosine = np.clip(cosine, -1.0, 1.0)
    angle = np.arccos(cosine)
    return float(np.degrees(angle))

def resample_sequence(seq, target_len):
    """
    seq: list or np.array of shape (N, D), N frames D dims (D=5 fingers)
    returns: np.array shape (target_len, D) with linear resampling
    """
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

def dtw_distance(seq1, seq2):
    """
    Classic O(N*M) DTW on multi-dimensional sequences.
    seq1, seq2: np.array shape (L1, D) and (L2, D)
    returns: dtw distance (float)
    """
    seq1 = np.array(seq1, dtype=float)
    seq2 = np.array(seq2, dtype=float)
    L1, D = seq1.shape
    L2 = seq2.shape[0]
    # cost matrix
    cost = np.full((L1+1, L2+1), np.inf, dtype=float)
    cost[0,0] = 0.0
    for i in range(1, L1+1):
        for j in range(1, L2+1):
            d = np.linalg.norm(seq1[i-1] - seq2[j-1])  # Euclidean across dimensions
            cost[i,j] = d + min(cost[i-1,j], cost[i,j-1], cost[i-1,j-1])
    return float(cost[L1, L2])

def sliding_window_score(buffer_seq, reference_seq):
    """
    buffer_seq: np.array (T, D), reference_seq: np.array (L, D).
    We will resample both to the same length (e.g., L) and compute normalized DTW-based similarity %
    """
    T = buffer_seq.shape[0]
    L = reference_seq.shape[0]
    # resample buffer to L
    buf_r = resample_sequence(buffer_seq, L)
    ref_r = reference_seq  # assume already resampled to L
    dist = dtw_distance(buf_r, ref_r)
    # Normalize: max difference per frame ≤ 180 per finger, D fingers
    D = ref_r.shape[1]
    max_possible = L * D * 180.0
    score = max(0.0, 100.0 * (1.0 - (dist / max_possible)))
    return score, dist

def ema_smooth(prev, current, alpha=0.6):
    """
    Exponential moving average smoothing for angle arrays.
    prev, current: np.array shape (D,)
    alpha: smoothing factor for new value (0..1). Higher alpha => responds faster.
    """
    if prev is None:
        return np.array(current, dtype=float)
    return alpha * np.array(current, dtype=float) + (1 - alpha) * np.array(prev, dtype=float)

def pose_similarity_strict(live_angles, ref_angles,
                           tolerance_deg=15,
                           hard_fail_deg=60):
    """
    tolerance_deg : angle error tolerated without penalty
    hard_fail_deg : angle error beyond which score = 0
    """

    diff = np.abs(live_angles - ref_angles)

    # HARD FAIL: any finger too wrong → 0%
    if np.any(diff > hard_fail_deg):
        return 0.0, np.zeros(5)

    # Soft region: within tolerance
    adj_diff = np.maximum(0, diff - tolerance_deg)

    per_finger = np.clip(
        100.0 * (1.0 - adj_diff / (hard_fail_deg - tolerance_deg)),
        0, 100
    )

    return float(np.mean(per_finger)), per_finger

