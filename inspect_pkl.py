import pickle
import csv

with open("reference.pkl", "rb") as f:
    data = pickle.load(f)["angles"]

with open("reference_angles.csv", "w", newline="") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow([
        "time_sec",
        "thumb_deg",
        "index_deg",
        "middle_deg",
        "ring_deg",
        "pinky_deg"
    ])

    t0 = data[0][0]  # normalize time
    for t, angles in data:
        writer.writerow([
            t - t0,
            angles[0],
            angles[1],
            angles[2],
            angles[3],
            angles[4]
        ])

print("Exported reference_angles.csv")
