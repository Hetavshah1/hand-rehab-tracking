import angel_conversion
import error
import emergency_stop
import Heat_glove
import motor_output

# the main iteration program
i = int(input("Enter the number of iterations: ")) # adding the number of iterations
z= int(input("Enter the mode of excercise: ")) # adding the mode of z
k=0
t = int(input("Enter the time of one cycel: ")) # time of one cycle
theta_ref = 0
m=0
c=0
 
# calibrate the sensors

# calibrate the servos
if (k<i):
    
    for k in range(0,i):  #....... adding the repitations for excercise
        for j in range(0,t):
            
            # Angel conversion module
            theta_servo_first = (m * theta_ref) + c
            theta_servo_second = (m * theta_ref) + c
            
            #Error calculation module

            # Motor output module
            
            #update the iteration
            
            if("emergency stop"):
                break
            
        if("emergency stop"):
            break
    # end of program
        
        
        
    