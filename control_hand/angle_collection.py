# This script is used to collect data from the flex sensor through arduino UNO adn then it is transfered to the Raspberry Pi and there it is saved into a CSV file
import serial
import csv
import time
from datetime import datetime

# Update if needed (ttyUSB0 or ttyACM1)
SERIAL_PORT = '/dev/ttyACM0'
BAUD_RATE = 9600
CSV_FILE = 'flex_sensor_data.csv'

# Open serial connection
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
time.sleep(2)  # Allow Arduino to reset

# Open CSV file
with open(CSV_FILE, mode='a', newline='') as file:
    writer = csv.writer(file)

    # Write header if file is empty
    if file.tell() == 0:
        writer.writerow(["Timestamp", "Flex_Value"])

    print("Logging started... Press CTRL+C to stop")

    try:
        while True:
            if ser.in_waiting > 0:
                raw_data = ser.readline().decode('utf-8').strip()

                if raw_data.isdigit():
                    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    writer.writerow([timestamp, raw_data])
                    file.flush()  # Ensure data is written immediately
                    print(timestamp, raw_data)

    except KeyboardInterrupt:
        print("\nLogging stopped")

    finally:
        ser.close()


# Libraries used:
'''python3 -m pip install pyserial
or

sudo apt update
sudo apt install python3-serial

Permission give : sudo adduser your_username dialout

'''