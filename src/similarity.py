import numpy as np
from scipy.signal import resample
from fastdtw import fastdtw

def compute_similarity(ref_dict, live_dict):
    scores = {}

    for finger in ref_dict.keys():
        ref = ref_dict[finger]
        live = np.array(live_dict[finger])

        if len(live) < 10:
            scores[finger] = 0.0
            continue

        # resample live to roughly same length
        live_rs = resample(live, len(ref))

        distance, _ = fastdtw(ref, live_rs)

        # normalize (tunable)
        score = max(0.0, 100.0 - distance / len(ref))
        scores[finger] = score

    overall = sum(scores.values()) / len(scores)
    return overall, scores
