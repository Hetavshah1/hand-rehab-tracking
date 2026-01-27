import pigpio
import time

SERVO_PIN = 16

pi= pigpio.pi()
if not pi.connected:
   exit()

print("Servo motor calibration")
print("Observe movement carefully")

try:
    #Finding the min limit
    print("Finding min limit ....")
    for pw in range(1000,500, -10):
        pw=int(pw)
        pw = max(500, min(2500,pw))
        pi.set_servo_pulsewidth(SERVO_PIN, pw)
        print("PW:", pw)
        time.sleep(0.2)
        
    # Finding the max limit
    print("\n Finding the max limit")    
    time.sleep(5)
    for pw in range(1500, 2501, 10):
        pw = int(pw)
        pw = max(500, min(2500, pw))
        pi.set_servo_pulsewidth(SERVO_PIN, pw)
        print("PW:", pw)
        time.sleep(0.2)
    
except KeyboardInterrupt:
   print("\nCalibration completed")

finally: 
   pi.set_servo_pulsewidth(SERVO_PIN, 0)
   pi.stop()


        
