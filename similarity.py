# similarity.py
import numpy as np

def similarity_score(ref_angles, live_angles):
    errors = []

    for k in ref_angles:
        if k in live_angles and ref_angles[k] is not None and live_angles[k] is not None:
            errors.append(abs(ref_angles[k] - live_angles[k]))

    if len(errors) == 0:
        return None

    mean_error = np.mean(errors)
    score = max(0, 100 - mean_error)
    return score
