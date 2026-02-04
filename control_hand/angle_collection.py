import serial
import csv
import time
from datetime import datetime

# ---------------- CONFIG ----------------
SERIAL_PORT = '/dev/ttyACM0'   # change if needed
BAUD_RATE = 115200
CSV_FILE = 'flex_angles.csv'

LABELS = ["Thumb", "index", "middle", "ring", "pinky"]
# ---------------------------------------

# Open serial connection
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
time.sleep(2)  # allow Arduino reset

with open(CSV_FILE, mode='a', newline='') as file:
    writer = csv.writer(file)

    # Write header only once
    if file.tell() == 0:
        writer.writerow(["Timestamp"] + LABELS)

    print("Logging started. Press CTRL+C to stop.")

    try:
        while True:
            line = ser.readline().decode('utf-8', errors='ignore').strip()

            if not line:
                continue

            # Example line:
            # Thumb:162.34 index:98.21 middle:105.77 ring:110.12 pinky:87.65
            parts = line.split()

            data = {}
            for part in parts:
                if ":" in part:
                    key, value = part.split(":")
                    if key in LABELS:
                        try:
                            data[key] = float(value)
                        except ValueError:
                            pass

            # Ensure full packet received
            if all(label in data for label in LABELS):
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

                row = [timestamp] + [data[label] for label in LABELS]
                writer.writerow(row)
                file.flush()

                print(row)

    except KeyboardInterrupt:
        print("\nLogging stopped.")

    finally:
        ser.close()
