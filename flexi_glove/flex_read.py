import time
import busio
import digitalio
import board
import adafruit_mcp3xxx.mcp3008 as MCP
from adafruit_mcp3xxx.analog_in import AnalogIn
import numpy as np


class FlexSensorReader:
    def __init__(self, num_sensors=5):
        # SPI setup
        self.spi = busio.SPI(
            clock=board.SCK,
            MISO=board.MISO,
            MOSI=board.MOSI
        )
        self.cs = digitalio.DigitalInOut(board.D8)
        self.mcp = MCP.MCP3008(self.spi, self.cs)

        self.channels = [
            AnalogIn(self.mcp, MCP.P0),
            AnalogIn(self.mcp, MCP.P1),
            AnalogIn(self.mcp, MCP.P2),
            AnalogIn(self.mcp, MCP.P3),
            AnalogIn(self.mcp, MCP.P4)
        ]

        # Calibration (CHANGE THESE!)
        self.ADC_MIN = 300
        self.ADC_MAX = 700
        self.ANGLE_MIN = 0.0
        self.ANGLE_MAX = 180.0

    def adc_to_angle(self, raw_adc):
        raw_adc = np.clip(raw_adc, self.ADC_MIN, self.ADC_MAX) # ensures no noise
        
        # “Take the raw ADC value from the flex sensor and convert it into a joint angle, assuming a linear relationship.”
        return np.interp(
            raw_adc,
            [self.ADC_MIN, self.ADC_MAX],
            [self.ANGLE_MIN, self.ANGLE_MAX]
        )

    def read_angles(self):
       '''read all the flex sensors here and maps the ADC value to the angle by using the adc_to_angle function'''

        finger_names = ["thumb", "index", "middle", "ring", "pinky"]
        angles = {}

        #zip function pairs elements from multiple iterables together, position-by-position
        #ch reads the values of flex sensor(resistance values) and raw converts it to the ADC language 
        for name, ch in zip(finger_names, self.channels):
            raw = ch.value >> 6   # scale 16-bit to ~10-bit
            angles[name] = self.adc_to_angle(raw) # mapping between the ADC values and the angles 

        return angles

    def read_at_fixed_times(self, total_seconds=5):
        """
        Reads angles exactly at 1s, 2s, ..., total_seconds
        RETURNS:
        list of (time_sec, angles_dict)
        """

        results = []
        start_time = time.time()

        for t in range(1, total_seconds + 1):
            while time.time() - start_time < t:
                pass  # busy wait for precise timing

            angles = self.read_angles()
            results.append((t, angles))

        return results
