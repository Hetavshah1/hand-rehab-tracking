
//For one flex sensor
const int flexPin = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int flexValue = analogRead(flexPin);  // 0–1023
  Serial.println(flexValue);            // Send to Raspberry Pi
  delay(200);                           // 5 samples per second
}
//For multiple flex sensors
const int NUM_SENSORS = 5;
const int flexPins[NUM_SENSORS] = {A0, A1, A2, A3, A4};

// EMA smoothing factor
const float ALPHA = 0.1;

// Calibration (CHANGE THESE PER SENSOR)
float adc_min[NUM_SENSORS] = {0.2, 59, 160, 19.5, 8};
float adc_max[NUM_SENSORS] = {2, 64, 164, 21, 34};

const char*label[] = {"Thumb","index","middle","ring","pinky"};

// Angle range
const float ANGLE_MIN = 25.0;
const float ANGLE_MAX = 180.0;

// EMA state
float emaValue[NUM_SENSORS];
bool emaInitialized[NUM_SENSORS] = {false, false, false, false, false};

// time initialization
int t=0;
int i=0;
// Floating-point mapping
float mapFloat(float x, float in_min, float in_max,
               float out_min, float out_max) {
  return (x - in_min) * (out_max - out_min) /
         (in_max - in_min) + out_min;
}

void setup() {
  Serial.begin(115200);
}

void loop() {
  

  // Print time first
 // Serial.print(t);
  //Serial.print(" ");


  // Process each sensor
  for (int i = 0; i < NUM_SENSORS; i++) {
    float rawADC = analogRead(flexPins[i]);

    // Initialize EMA
    if (!emaInitialized[i]) {
      emaValue[i] = rawADC;
      emaInitialized[i] = true;
    }

    // EMA filtering
    emaValue[i] = ALPHA * rawADC + (1.0 - ALPHA) * emaValue[i]; // Exponential Smoothing
    if(i==0){
       float angle = mapFloat(
      emaValue[i],
      adc_min[i],
      adc_max[i],
      150,
      180
    );
    // Avoiding the external noise and constraining the angles within limit
    if (angle < ANGLE_MIN) angle = ANGLE_MIN;
    if (angle > ANGLE_MAX) angle = ANGLE_MAX;
    
    Serial.print(label[i]);
    Serial.print(":");
    Serial.print(angle, 2);
    Serial.print(" ");
 
      }
    else{
    // Map to angle
    float angle = mapFloat(
      emaValue[i],
      adc_min[i],
      adc_max[i],
      ANGLE_MIN,
      ANGLE_MAX
    );

    // Clamp
    if (angle < ANGLE_MIN) angle = ANGLE_MIN;
    if (angle > ANGLE_MAX) angle = ANGLE_MAX;

    // Print angle
    Serial.print(label[i]);
    Serial.print(":");
    Serial.print(angle, 2);
    Serial.print(" ");
    if (i < NUM_SENSORS - 1) Serial.print(" ");
  } 
  }
  Serial.println();
  //t++;
  delay(48);
}