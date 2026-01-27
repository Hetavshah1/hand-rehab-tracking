import time
import busio
import digitalio
import board
import adafruit_mcp3xxx.mcp3008 as MCP
from adafruit_mcp3xxx.analog_in import AnalogIn

# SPI setup
spi = busio.SPI(clock=board.SCK, MISO=board.MISO, MOSI=board.MOSI)
cs = digitalio.DigitalInOut(board.D8)  # CE0

# MCP3008 setup
mcp = MCP.MCP3008(spi, cs)

# Create channels for 5 sensors
channels = [
    AnalogIn(mcp, MCP.P0),
    AnalogIn(mcp, MCP.P1),
    AnalogIn(mcp, MCP.P2),
    AnalogIn(mcp, MCP.P3),
    AnalogIn(mcp, MCP.P4)
]

print("Reading 5 analog sensors...\n")

while True:
    readings = []
    for i, ch in enumerate(channels):
        raw = ch.value        # 0–65535 (scaled from 10-bit)
        voltage = ch.voltage # Actual voltage
        readings.append((raw, voltage))

    for i, (raw, voltage) in enumerate(readings):
        print(f"Sensor {i+1}: Raw = {raw:5d} | Voltage = {voltage:.3f} V")

    print("-" * 50)
    time.sleep(0.5)
