# marker_source.py

def get_markers_debug(tracking_points):
    """
    Returns marker list from debug mode (mouse clicks + optical flow)
    """
    if tracking_points is None:
        return []

    return [tuple(p[0]) for p in tracking_points]


def get_markers_passive(frame):
    """
    Placeholder for passive neon marker detection.
    Will be implemented later.
    """
    return []
