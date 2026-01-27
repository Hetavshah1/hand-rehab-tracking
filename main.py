import cv2
import numpy as np

from config import DEBUG_MODE
from tracker import track_points
from marker_source import get_markers_debug
from hand_model import empty_hand
from landmark_mapper import map_markers_to_landmarks
from angles import joint_angle

# ---------------- GLOBAL STATE ----------------
clicked_markers = []
tracking_points = None
selecting = False
prev_gray = None

# Simulates UI input: which landmarks are present
valid_landmarks = {i: True for i in range(21)}
# ----------------------------------------------


def mouse_callback(event, x, y, flags, param):
    global clicked_markers, selecting
    if selecting and event == cv2.EVENT_LBUTTONDOWN:
        clicked_markers.append([x, y])
        print(f"Marker added at ({x}, {y})")


def main():
    global selecting, tracking_points, prev_gray, clicked_markers

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: Camera not accessible")
        return

    cv2.namedWindow("Mode 2 - Passive Optical (Debug)")
    cv2.setMouseCallback("Mode 2 - Passive Optical (Debug)", mouse_callback)

    print("MODE 2 – PASSIVE OPTICAL (DEBUG MODE)")
    print("c = click markers | s = start tracking | r = reset | q = quit")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        display = frame.copy()

        # ---------- TRACKING ----------
        if tracking_points is not None and prev_gray is not None:
            tracking_points = track_points(prev_gray, gray, tracking_points)

            for p in tracking_points:
                x, y = p.ravel()
                cv2.circle(display, (int(x), int(y)), 6, (0, 255, 0), -1)

        # ---------- DEBUG MARKERS ----------
        if selecting:
            for p in clicked_markers:
                cv2.circle(display, tuple(p), 6, (0, 255, 255), -1)

        # ---------- LANDMARK MAPPING ----------
        markers = (
            [tuple(p[0]) for p in tracking_points]
            if tracking_points is not None
            else []
        )

        landmarks = map_markers_to_landmarks(markers, valid_landmarks)

        # ---------- ANGLE COMPUTATION (INDEX FINGER EXAMPLE) ----------
        # MediaPipe-style indices:
        # 5 = index MCP, 6 = index PIP, 7 = index DIP
        index_pip_angle = joint_angle(
            landmarks[5],
            landmarks[6],
            landmarks[7]
        )

        if index_pip_angle is not None:
            cv2.putText(
                display,
                f"Index PIP Angle: {int(index_pip_angle)} deg",
                (10, 70),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2
            )

        cv2.imshow("Mode 2 - Passive Optical (Debug)", display)

        key = cv2.waitKey(1) & 0xFF

        if key == ord('c'):
            clicked_markers = []
            tracking_points = None
            selecting = True
            prev_gray = None
            print("Click mode ON")

        elif key == ord('s') and len(clicked_markers) > 0:
            tracking_points = np.array(
                clicked_markers, dtype=np.float32
            ).reshape(-1, 1, 2)
            selecting = False
            prev_gray = gray.copy()
            print("Tracking started")

        elif key == ord('r'):
            clicked_markers = []
            tracking_points = None
            selecting = False
            prev_gray = None
            print("Reset")

        elif key == ord('q'):
            break

        prev_gray = gray.copy()

    cap.release()
    cv2.destroyAllWindows()
    print("Exited cleanly")


if __name__ == "__main__":
    main()
