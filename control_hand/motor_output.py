# motor output module
from board import SCL,SDA
import busio
from adafruit_pca9685 import PCA9685
from adafruit_servokit import ServoKit
import RPi.GPIO as GPIO
import time

# Create I2C bus
i2c = busio.I2C(SCL,SDA)

# Initializing PCA9685 using I2C
pca = PCA9685(i2c)
pca.frequency = 50


kit = ServoKit(channels=16)

servo=kit.servo[0]
try:

   while True:
      for angle in range(0,180,10):
          servo.angle = angle
          time.sleep(0.5)
      for angle in range(180,0,-10):
          servo.angle = angle
          time.sleep(0.5)
except KeyboardInterrupt:
    print("Prgoram stopped by user")
    
# adafruit checking
'''def set_angle(angle):
   duty = 2 + (angle/18)
   GPIO.output(SERVO_PIN,True)
   pwm.changeDutyCycle(duty)
   time.sleep(0.5)
   GPIO.output(SERVO_PIN,False)
   pwm.changeDutyCycle(0)

'''
# initialize the servo motor in a different function
# input the motor commands
# output the motor commands

