import time
import cv2
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from serial_reader import SerialAngleReader
from similarity import compute_similarity

# ================= CONFIG =================
SERIAL_PORT = "COM5"
BAUD_RATE = 115200

REFERENCE_CSV = "data/reference/reference_angles.csv"
REFERENCE_VIDEO = "data/reference/reference.mp4"
# =========================================


def load_reference():
    df = pd.read_csv(REFERENCE_CSV)

    ref = {
        "time": df["time_sec"].to_numpy(),
        "thumb_deg": df["thumb_deg"].to_numpy(),
        "index_deg": df["index_deg"].to_numpy(),
        "middle_deg": df["middle_deg"].to_numpy(),
        "ring_deg": df["ring_deg"].to_numpy(),
        "pinky_deg": df["pinky_deg"].to_numpy(),
    }

    duration = ref["time"][-1] - ref["time"][0]
    samples = len(ref["time"])

    return ref, duration, samples


# -------- Accuracy Mapping --------
def map_accuracy(raw, low=45.0, high=70.0):
    if raw <= low:
        return 45.0
    if raw >= high:
        return 100.0
    return 45.0 + (raw - low) / (high - low) * 55.0


def main():
    print("Loading reference...")
    ref, REF_DURATION, REF_SAMPLES = load_reference()
    print(f"Reference duration: {REF_DURATION:.2f}s")

    reader = SerialAngleReader(SERIAL_PORT, BAUD_RATE)
    cap = cv2.VideoCapture(REFERENCE_VIDEO)

    # -------- Graph --------
    plt.ion()
    fig, ax = plt.subplots()
    acc_time = []
    acc_values = []
    line, = ax.plot([], [], marker="o")
    ax.set_ylim(45, 100)
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Accuracy (%)")
    ax.set_title("Accuracy vs Time")

    session_start = time.time()

    collecting = False
    rep_start_time = None
    live_data = None

    print("Mode-3 running (STRICT reference timing)")

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

        # -------- START --------
        if not collecting:
            collecting = True
            rep_start_time = time.time()
            live_data = {k: [] for k in ["thumb_deg","index_deg","middle_deg","ring_deg","pinky_deg"]}
            print("Repetition started")

        # -------- Collect --------
        for k in live_data:
            live_data[k].append(angles[k])

        # -------- END --------
        if time.time() - rep_start_time >= REF_DURATION:
            collecting = False

            # Resample live to reference length
            resampled = {}
            for k in live_data:
                arr = np.array(live_data[k])
                x_old = np.linspace(0, 1, len(arr))
                x_new = np.linspace(0, 1, REF_SAMPLES)
                resampled[k] = np.interp(x_new, x_old, arr)

            raw_overall, finger_scores = compute_similarity(
                {
                    "thumb_deg": ref["thumb_deg"],
                    "index_deg": ref["index_deg"],
                    "middle_deg": ref["middle_deg"],
                    "ring_deg": ref["ring_deg"],
                    "pinky_deg": ref["pinky_deg"],
                },
                resampled,
            )

            mapped_overall = map_accuracy(raw_overall)

            t = time.time() - session_start
            acc_time.append(t)
            acc_values.append(mapped_overall)

            line.set_data(acc_time, acc_values)
            ax.set_xlim(0, max(acc_time) + 0.1)
            plt.pause(0.001)

            print(
                f"Accuracy: {mapped_overall:6.2f}% "
                f"(raw: {raw_overall:5.2f}%) | "
                f"T:{finger_scores['thumb_deg']:5.1f} "
                f"I:{finger_scores['index_deg']:5.1f} "
                f"M:{finger_scores['middle_deg']:5.1f} "
                f"R:{finger_scores['ring_deg']:5.1f} "
                f"P:{finger_scores['pinky_deg']:5.1f}"
            )

            live_data = None

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
