from hand_model import empty_hand

def map_markers_to_landmarks(markers, valid_landmarks):
    """
    Temporary mapping:
    - markers: list of (x, y)
    - valid_landmarks: dict {index: True/False}

    For now, mapping is based on ORDER.
    This will be replaced later by geometric logic.
    """

    landmarks = empty_hand()

    marker_idx = 0
    for lm_idx in range(21):
        if not valid_landmarks.get(lm_idx, True):
            landmarks[lm_idx] = None
            continue

        if marker_idx < len(markers):
            landmarks[lm_idx] = markers[marker_idx]
            marker_idx += 1
        else:
            landmarks[lm_idx] = None

    return landmarks
