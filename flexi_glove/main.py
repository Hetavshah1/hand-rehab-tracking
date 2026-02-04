from flex_read import FlexSensorReader
from error import AngleErrorCalculator


def main():
    sensor_reader = FlexSensorReader()
    error_calc = AngleErrorCalculator("reference_angles.csv")

    print("\nStarting 5-second acquisition...\n")

    data = sensor_reader.read_at_fixed_times(total_seconds=7)

    for time_sec, measured_angles in data:
        finger_errors, similarity = error_calc.compute_error(measured_angles,time_sec)

        print(f"Time = {time_sec}s")
        print("Measured angles:", measured_angles)
        print("Finger errors:", finger_errors)
        print(f"Similarity: {similarity:.2f}°")
        print("-" * 50)


if __name__ == "__main__":
    main()
