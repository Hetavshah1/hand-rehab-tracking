#controlling using pigpio library
import pigpio
import time
SERVO_PIN = 16

min_pw = 500  
max_pw = 2500 
 
pi = pigpio.pi()

if not pi.connected:
   exit()

try:

      angle = 0
      pw = min_pw + (angle/180)*(max_pw - min_pw)
      pw=int(pw)
      pw = max(500, min(2500,pw))
      print("Angle:", angle, "PW:",pw)
      pi.set_servo_pulsewidth(SERVO_PIN,pw)
      time.sleep(0.5)
      
except KeyboardInterrupt:
   pass

finally:
   pi.set_servo_pulsewidth(SERVO_PIN, 0)
   pi.stop()