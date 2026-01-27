# flex sensor reading using MCP3008 and raspberry pi
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

# Flex sensor on channel 0
flex_channel = AnalogIn(mcp, MCP.P0)

print("Reading flex sensor...")

while True:
    raw_value = flex_channel.value      # 0 - 65535
    voltage = flex_channel.voltage      # actual voltage

    print(f"Raw: {raw_value}  Voltage: {voltage:.2f} V")
    time.sleep(0.5)
