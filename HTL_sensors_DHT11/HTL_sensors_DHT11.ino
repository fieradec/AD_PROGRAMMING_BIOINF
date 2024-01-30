#include <DHT.h>

// Define the type of sensor and the pin it's connected to
#define DHT_PIN 4      // Pin where the DHT11 is connected
#define DHT_TYPE DHT11 // Type of the DHT sensor

DHT dht(DHT_PIN, DHT_TYPE);

const int pwmPin = 9; // digital pin (pwm) led is connected to 
const int analogInPin = A1;  // Analog input pin that the light sensor is attached to

// LED read vars
String inputString = ""; // a string to hold incoming data
boolean pwmComplete = false;
boolean ledToggle = false;
int led_active = 0;

// LDR vars
int sensorValue = 0;        // value read from the pot
int prevsensorValue = 0;

void setup() {
  Serial.begin(9600); // initialize serial communications at 9600 bps

  dht.begin();

  // init LED
  pinMode(pwmPin, OUTPUT);
  analogWrite(pwmPin, 0);
}


void loop() {

   // Recieve data from Node and write it to a String
   while (Serial.available() && pwmComplete == false) {
    char inChar = (char)Serial.read();
    if(inChar == 'P'){
      pwmComplete = true;
    }
    else if(inChar == 'E'){
      ledToggle = true;
    }
    else{
      inputString += inChar; 
    }
  }
  
  // Dim LED
  if(!Serial.available() && pwmComplete == true)
  {
    // convert String to int. 
    int recievedVal = stringToInt();
    
    analogWrite(pwmPin,recievedVal);
    
    pwmComplete = false;
  }
  
  // Toggle LED
  if(!Serial.available() && ledToggle == true)
  {
    int recievedVal = stringToInt();
    
    // toggle led output
    if(led_active == 0) {
        analogWrite(pwmPin,255);
        led_active = 1;
    }
    else{
        analogWrite(pwmPin,0);
        led_active = 0;
    }
    
    ledToggle = false;
  }

  // Reading temperature or humidity takes about 250 milliseconds!
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  // Check if any reads failed and exit early (to try again).
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // Reading from analog sensor
  int sensorValue = analogRead(analogInPin);
  float lightLevel = sensorValue/1024.*100;

  // Display
  
  Serial.print("A");
  Serial.print(lightLevel);
  Serial.print("B");

  Serial.print("C");
  Serial.print(temperature);
  Serial.print("D");

  Serial.print("E");
  Serial.print(humidity);
  Serial.print("F"); // Marks the end of the serie of measurements
  
  
  // Wait  
  delay(250);
  }

int stringToInt()
{
    char charHolder[inputString.length()+1];
    inputString.toCharArray(charHolder,inputString.length()+1);
    inputString = "";
    int _recievedVal = atoi(charHolder);
    return _recievedVal;
}
