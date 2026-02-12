import serial
import time
import re

# Case-insensitive mapping
LABEL_MAP = {
    "thumb": "thumb_deg",
    "index": "index_deg",
    "middle": "middle_deg",
    "ring": "ring_deg",
    "pinky": "pinky_deg"
}

PATTERN = re.compile(
    r"(Thumb|index|middle|ring|pinky)\s*:\s*([-+]?\d*\.?\d+)"
)

class SerialAngleReader:
    def __init__(self, port="COM3", baud=115200):
        self.ser = serial.Serial(port, baud, timeout=1)
        time.sleep(2)

    def read(self):
        line = self.ser.readline().decode(errors="ignore").strip()
        if not line:
            return None

        #print("RAW:", line)  # keep for now

        matches = PATTERN.findall(line)
        if len(matches) != 5:
            print("Incomplete parse:", matches)
            return None

        data = {}
        for label, value in matches:
            label = label.lower()
            data[LABEL_MAP[label]] = float(value)

        timestamp = time.time()
        return timestamp, data

    def close(self):
        self.ser.close()
