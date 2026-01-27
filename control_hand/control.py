import RPi.GPIO as GPIO
import time

GPIO.cleanup()
GPIO.setmode(GPIO.BCM)
# Use BCM GPIO numbering
SERVO_PIN = 16
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

    for i in range(0, 1760, 10):
        set_angle(i)     # 0 degree
        

except KeyboardInterrupt:
    pwm.stop()
    GPIO.cleanup()
