import time
import cv2
import pandas as pd
import numpy as np
from collections import deque
import matplotlib.pyplot as plt

from serial_reader import SerialAngleReader
from similarity import compute_similarity

# ================= CONFIG =================
SERIAL_PORT = "COM5"
BAUD_RATE = 115200

REFERENCE_CSV = "data/reference/reference_angles.csv"
REFERENCE_VIDEO = "data/reference/reference.mp4"

WINDOW_SIZE = 120          # sliding window (frames)
SIMILARITY_EVERY = 20      # compute every N new samples
# =========================================


def load_reference():
    df = pd.read_csv(REFERENCE_CSV)
    return {
        "thumb_deg": df["thumb_deg"].to_numpy(),
        "index_deg": df["index_deg"].to_numpy(),
        "middle_deg": df["middle_deg"].to_numpy(),
        "ring_deg": df["ring_deg"].to_numpy(),
        "pinky_deg": df["pinky_deg"].to_numpy(),
    }


def main():
    print("Loading reference...")
    ref_angles = load_reference()
    print("Reference loaded")

    # Sliding buffers
    live_data = {
        k: deque(maxlen=WINDOW_SIZE)
        for k in ref_angles.keys()
    }

    reader = SerialAngleReader(SERIAL_PORT, BAUD_RATE)
    cap = cv2.VideoCapture(REFERENCE_VIDEO)

    # -------- Graph --------
    plt.ion()
    fig, ax = plt.subplots()
    acc_time = []
    acc_values = []
    line, = ax.plot([], [], marker="o")
    ax.set_ylim(0, 100)
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Accuracy (%)")
    ax.set_title("Accuracy vs Time")

    start_time = time.time()
    sample_count = 0

    print("Mode-3 running (press Q to stop)")

    while True:
        # -------- Video --------
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        cv2.imshow("Reference Exercise", frame)

        # -------- Serial --------
        sample = reader.read()
        if not sample:
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
            continue

        _, angles = sample
        sample_count += 1

        for k in live_data:
            live_data[k].append(angles[k])

        # -------- Similarity --------
        if len(live_data["index_deg"]) == WINDOW_SIZE and sample_count % SIMILARITY_EVERY == 0:
            overall, finger_scores = compute_similarity(ref_angles, live_data)

            t = time.time() - start_time
            acc_time.append(t)
            acc_values.append(overall)

            line.set_data(acc_time, acc_values)
            ax.set_xlim(0, max(acc_time) + 0.1)
            plt.pause(0.001)

            print(
                f"Overall: {overall:6.2f}% | "
                f"T:{finger_scores['thumb_deg']:5.1f} "
                f"I:{finger_scores['index_deg']:5.1f} "
                f"M:{finger_scores['middle_deg']:5.1f} "
                f"R:{finger_scores['ring_deg']:5.1f} "
                f"P:{finger_scores['pinky_deg']:5.1f}"
            )

        # -------- Exit --------
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    reader.close()
    cap.release()
    cv2.destroyAllWindows()
    plt.ioff()
    plt.show()
    print("Session ended")


if __name__ == "__main__":
    main()
