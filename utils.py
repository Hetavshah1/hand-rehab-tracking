import numpy as np

def euclidean_distance(p1, p2):
    """Compute Euclidean distance between two 2D points"""
    return np.linalg.norm(np.array(p1) - np.array(p2))


def clamp(value, min_val, max_val):
    """Clamp a value between min and max"""
    return max(min_val, min(max_val, value))
