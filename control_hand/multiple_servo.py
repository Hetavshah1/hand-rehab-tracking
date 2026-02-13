# controlling multiple servos (robotic hand) using pigpio
import pigpio
import time

# Map fingers to GPIO pins
FINGERS = { "thumb": 16,"index": 17,"middle": 18,"ring": 22,"pinky": 23} # dictonary declared for the fingers

min_pw = 500    # minimum pulse width (µs)
max_pw = 2500   # maximum pulse width (µs)

pi = pigpio.pi() # connection between the raspberry pi and pigpio library

if not pi.connected:
    exit()

def angle_to_pw(angle):
    pw = min_pw + (angle / 180) * (max_pw - min_pw)
    return int(max(min_pw, min(max_pw, pw))) # clamping the pulse width to the minimum and maximum pulse width to avoid noise

try:
    # Sweep from 0 to 180 degrees
    for angle in range(0, 180, 5):
        pw = angle_to_pw(angle)

        # Set pulse width for all fingers
        for pin in FINGERS.values():
            pi.set_servo_pulsewidth(pin, pw)

        # Print single-line finger status
        output = []
        for finger in ["thumb", "index", "middle", "ring", "pinky"]:
            output.append(f"{finger}: {angle}° {pw}µs")

        print(" | ".join(output))
        time.sleep(0.5)

    # Sweep back from 180 to 0 degrees
    for angle in range(180, -1, -5):
        pw = angle_to_pw(angle)

        for pin in FINGERS.values():
            pi.set_servo_pulsewidth(pin, pw)

        output = []
        for finger in ["thumb", "index", "middle", "ring", "pinky"]:
            output.append(f"{finger}: {angle}° {pw}µs")

        print(" | ".join(output))
        time.sleep(0.5)

except KeyboardInterrupt:
    pass

finally:
    # Stop all servos
    for pin in FINGERS.values():
        pi.set_servo_pulsewidth(pin, 0)
    pi.stop()
