# tracker.py
import cv2
import numpy as np
from config import WIN_SIZE, MAX_LEVEL, CRITERIA

def track_points(prev_gray, gray, points):
    new_points, status, _ = cv2.calcOpticalFlowPyrLK(
        prev_gray,
        gray,
        points,
        None,
        winSize=WIN_SIZE,
        maxLevel=MAX_LEVEL,
        criteria=CRITERIA
    )

    good_new = new_points[status == 1]
    return good_new.reshape(-1, 1, 2)
