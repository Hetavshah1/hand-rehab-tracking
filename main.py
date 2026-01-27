import cv2
import numpy as np
import math

# ---------------- CONFIG ----------------
MAX_MARKERS = 21
# ----------------------------------------
# Global variables
clicked_markers = []
tracking_points = None
selecting = False
prev_gray = None


import math

def calculate_angle(A, B, C):
    """
    Calculates angle at point B formed by points A-B-C
    """
    if A is None or B is None or C is None:
        return None

    BA = (A[0] - B[0], A[1] - B[1])
    BC = (C[0] - B[0], C[1] - B[1])

    dot = BA[0] * BC[0] + BA[1] * BC[1]
    magBA = math.hypot(BA[0], BA[1])
    magBC = math.hypot(BC[0], BC[1])

    if magBA == 0 or magBC == 0:
        return None

    cos_angle = dot / (magBA * magBC)
    cos_angle = max(-1.0, min(1.0, cos_angle))

    angle = math.degrees(math.acos(cos_angle))
    return angle


def mouse_callback(event, x, y, flags, param):
    global clicked_markers, selecting

    if selecting and event == cv2.EVENT_LBUTTONDOWN:
        if len(clicked_markers) < MAX_MARKERS:
            clicked_markers.append([x, y])
            print(f"Marker added at ({x}, {y})")


def main():
    global selecting, tracking_points, prev_gray, clicked_markers

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: Camera not accessible")
        return

    cv2.namedWindow("Debug Marker Mode")
    cv2.setMouseCallback("Debug Marker Mode", mouse_callback)

    print("DEBUG MARKER MODE (Optical Flow)")
    print("c = click markers | s = start tracking | r = reset | q = quit")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        display = frame.copy()

        # If tracking is active, update marker positions
        if tracking_points is not None and prev_gray is not None:
        # ---------------- ANGLE COMPUTATION (DEBUG) ----------------
            if tracking_points is not None and len(tracking_points) >= 3:
            # IMPORTANT:
            # tracking_points[0] -> Fingertip
            # tracking_points[1] -> Middle joint
            # tracking_points[2] -> Knuckle

                A = tracking_points[0][0]
                B = tracking_points[1][0]
                C = tracking_points[2][0]

                angle = calculate_angle(A, B, C)

                if angle is not None:
                    cv2.putText(
                    display,
                    f"Finger Angle: {int(angle)} deg",
                    (10, 70),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 0),
                    2
                )
        # -------------------------------------------------------------
            
            new_points, status, _ = cv2.calcOpticalFlowPyrLK(
                prev_gray,
                gray,
                tracking_points,
                None,
                winSize=(21, 21),
                maxLevel=3,
                criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01)
            )

            good_new = new_points[status == 1]
            good_old = tracking_points[status == 1]

            tracking_points = good_new.reshape(-1, 1, 2)

            for p in tracking_points:
                x, y = p.ravel()
                cv2.circle(display, (int(x), int(y)), 6, (0, 255, 0), -1 )

        # Draw clicked (pre-tracking) markers
        if selecting:
            for p in clicked_markers:
                cv2.circle(display, tuple(p), 6, (0, 255, 255), -1)

        cv2.putText(
            display,
            f"Tracking: {'ON' if tracking_points is not None else 'OFF'}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )

        cv2.imshow("Debug Marker Mode", display)

        key = cv2.waitKey(1) & 0xFF

        if key == ord('c'):
            clicked_markers = []
            tracking_points = None
            selecting = True
            prev_gray = None
            print("Click mode ON")

        elif key == ord('s') and len(clicked_markers) > 0:
            tracking_points = np.array(clicked_markers, dtype=np.float32).reshape(-1, 1, 2)
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
