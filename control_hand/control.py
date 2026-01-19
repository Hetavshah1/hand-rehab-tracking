import RPi.GPIO as GPIO
import time

# Use BCM GPIO numbering
GPIO.setmode(GPIO.BCM)

SERVO_PIN = 18
GPIO.setup(SERVO_PIN, GPIO.OUT)

# Set PWM frequency to 50Hz (standard for servo)
pwm = GPIO.PWM(SERVO_PIN, 50)
pwm.start(0)

def set_angle(angle):
    duty = 2 + (angle / 18)
    GPIO.output(SERVO_PIN, True)
    pwm.ChangeDutyCycle(duty)
    time.sleep(0.5)
    GPIO.output(SERVO_PIN, False)
    pwm.ChangeDutyCycle(0)

try:
    while True:
        for i in range(0, 180, 10):
            set_angle(i)     # 0 degrees
            time.sleep(1)
        for i in range(180, 0, -10):
            set_angle(i)     # 0 degrees
            time.sleep(1)

except KeyboardInterrupt:
    pwm.stop()
    GPIO.cleanup()
