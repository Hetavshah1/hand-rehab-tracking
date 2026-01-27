# angles.py
import math
import numpy as np

def joint_angle(A, B, C):
    if A is None or B is None or C is None:
        return None

    BA = np.array(A) - np.array(B)
    BC = np.array(C) - np.array(B)

    norm_ba = np.linalg.norm(BA)
    norm_bc = np.linalg.norm(BC)

    if norm_ba == 0 or norm_bc == 0:
        return None

    cos_val = np.dot(BA, BC) / (norm_ba * norm_bc)
    cos_val = max(-1.0, min(1.0, cos_val))

    return math.degrees(math.acos(cos_val))
