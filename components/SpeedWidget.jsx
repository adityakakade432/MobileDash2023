import { View, Text, StyleSheet, Dimensions, ProgressBar, TextInput, TouchableOpacity } from "react-native"
const { width, height } = Dimensions.get("window");
import Svg, { Path } from 'react-native-svg';
import React, {useState, useEffect} from 'react';
import { Stopwatch } from 'react-native-stopwatch-timer'



const interpolateColor = (speed, minSpeed, maxSpeed, startColor, endColor) => {
  // Calculate ratio of current speed within speed range
  const ratio = (speed - minSpeed) / (maxSpeed - minSpeed);
  // Interpolate the red and green components of the color
  const red = startColor[0] + ratio * (endColor[0] - startColor[0]);
  const green = startColor[1] + ratio * (endColor[1] - startColor[1]);
  return `rgb(${Math.round(red)}, ${Math.round(green)}, ${startColor[2]})`;
};

// Define start (red) and end (green) colors in RGB
const startColor = [150, 0, 50]; // Red
const endColor = [0, 150, 50]; // Green

const maxSpeed = 20;
const speed = 20; // Need to get this value
const speedBarWidth = `0%`; // Need to be updating this value on speed value change
const speedBarColor = interpolateColor(speed, 0, maxSpeed, startColor, endColor);

const PI = 3.1415926536;
const wheelDiameter = 22.42; // inches

export default function SpeedWidget({readings}) {
  // speedometer 
  const [speed, setSpeed] = useState("0"); // initial value
  const [speedBarWidth, setSpeedBarWidth] = useState('0%');
  const [speedBarColor, setSpeedBarColor] = useState(startColor);

  useEffect(() => {
    const calcSpeed = (leftRPM, rightRPM, diameter) => {
      let avgRPM = (parseFloat(leftRPM) + parseFloat(rightRPM)) / 2;
      let inchesPerMin = diameter * PI * avgRPM;
      let milesPerHour = inchesPerMin * (60.0 / 63360.0);
      return milesPerHour;
    };
  
    if (readings) {
      let calculatedSpeed = calcSpeed(readings['LEFT RPM'], readings['RIGHT RPM'], wheelDiameter);
      // Check for NaN and use 0 instead
      calculatedSpeed = isNaN(calculatedSpeed) ? 0 : calculatedSpeed;
      // Round to nearest integer
      //calculatedSpeed = Math.round(calculatedSpeed);
      
      setSpeed(calculatedSpeed.toString()); // Convert to string for the TextInput value
      
      const newWidth = `${(Math.max(0, Math.min(calculatedSpeed, maxSpeed)) / maxSpeed) * 98}%`;
      const newColor = interpolateColor(calculatedSpeed, 0, maxSpeed, startColor, endColor);
      setSpeedBarWidth(newWidth);
      setSpeedBarColor(newColor);
    }
  }, [readings]);
  

  // stopwatch implementation 
  const [lapTime, setLapTime] = useState(0);
  const [lapData, setLapData] = useState([]);
  const [totalTimeData, setTimeData] = useState([]);
  const [totalTime, setTotalTime] = useState(0);
  const [isStopwatchStart, setIsStopwatchStart] = useState(false);
  const [resetStopwatch, setResetStopwatch] = useState(false);
  const [lapCounter, setLapCount] = useState(0);

  const handleLapPress = () => {
    // Save the lap time and reset the stopwatch
    if (isStopwatchStart) {
      // Save the lap time and reset the stopwatch
      setLapTime(lapTime + totalTime);
      setLapData((prevLapData) => [...prevLapData, lapTime + totalTime]);
      setLapTime(0);
      setLapCount((prevLapCount) => prevLapCount + 1);
    }
  };

  const handleTotalTimePress = (time) => {

    if (totalTime != 0) { // Send data if there is any
      sendData(null, null, totalTime);
    }

    setIsStopwatchStart(!isStopwatchStart);
    if (isStopwatchStart) {
      // If Stopwatch is stopping, reset should be false
      setResetStopwatch(false);
      // console.log("Resetting lap count");
      setLapCount(0);
      setTimeData((prevTotal) => [...prevTotal, totalTime]);
      setTotalTime(0);
      setLapData([]);
  }

  function calcSpeed(leftRPM, rightRPM, diameter) {
    let avgRPM = (leftRPM + rightRPM) / 2;
    let inchesPerMin = diameter * PI * avgRPM;
    let milesPerHour = inchesPerMin * (60.0 / 63360.0);
    return milesPerHour;
  }

  function sendData(lap_ids, lap_times, total_time) {
    const postData = {
      lap_ids: lap_ids,
      lap_times: lap_times,
      total_time: total_time,
    };
    console.log(postData);

    fetch('http://live-timing-dash.herokuapp.com/insert/lap_uc24', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Successfully sent timer data to Live-Timing Dash');
    })
    .catch((error) => {
      console.error('Error in sending timer data to Live-Timing Dash:', error);
    });
  }
};

  return (
    <View style={styles.speed}>
      <View style={styles.speedCircle}>
        <Text style={styles.speedText}>{Math.round(speed)}</Text>
        <Text style={styles.speedUnitText}>mph</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: speedBarWidth }, { backgroundColor: speedBarColor }]} />
      </View>
      <View style={styles.totalTimeCircle}>
      </View>
      
      <TouchableOpacity onPress={handleLapPress} style={[styles.lapMinCircle]}>
        <Text style={[styles.unitText, { fontSize: 13, margin:0 }]}>{lapData.length > 0 ? lapData[lapData.length - 1]  : ""}</Text>

        <Text style={[styles.unitText, { fontSize: 20, margin:0 }]}>Lap {lapCounter}</Text>
        

      </TouchableOpacity>

      <TouchableOpacity onPress={handleTotalTimePress} style={[styles.totalTimeCircle]}>
        <Text style={[styles.unitText, {fontSize: 13, margin:0} ]}></Text>
        {isStopwatchStart ? (
          <Stopwatch
            laps
            msecs
            start={isStopwatchStart}
            reset={resetStopwatch}
            getTime={(time) => setTotalTime(time)} 
            options={options}
          />
        ) : null}
        <Text style={[styles.unitText, {fontSize: 20, margin:0, bottom: 10}]}>{isStopwatchStart ? "Reset" : "Start"}</Text>
      </TouchableOpacity>

    

    </View>
  );
}

const options = {
  container: {
    backgroundColor: 'transparent',
    padding: 5,
    borderRadius: 5,
    width: 220,
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    color: 'black',
    marginLeft: 7,
  }
};

const formatTime = (time) => {
  const sec = Math.floor(time / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const milliseconds = time % 1000;

  const formattedTime = `${pad(hr)}:${pad(min % 60)}:${pad(sec % 60)}.${pad(milliseconds)}`;
  return formattedTime;
};
const pad = (num) => (num < 10 ? `0${num}` : num.toString());

const styles = StyleSheet.create({
  speed: {
    backgroundColor: "#fad0c3",
    height: width - 10,
    flex: 5,
    borderRadius: 20,
    marginBottom: 15,
    marginTop: 15,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  progressBarContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 110,
    height: 10, 
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    transform: [{ rotate: '90deg' }],
    borderRadius: 20,

    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  progressBar: {
    height: '85%',
    borderRadius: 5, 
    justifyContent: 'center',

    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  speedCircle: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 230,
    height: 230,
    borderRadius: 250 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    transform: [{ rotate: '90deg' }],
    borderWidth: 5,
    borderColor: '#ff6666',
    right: 10,

    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },

  lapMinCircle: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    transform: [{ rotate: '90deg' }],
    borderWidth: 5,
    borderColor: '#ff6666',
    top: 10, 
    left: 10,

    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  
  totalTimeCircle: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    transform: [{ rotate: '90deg' }],
    borderWidth: 5,
    borderColor: '#ff6666',
    bottom: 10, 
    left: 10,

    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  speedText: {
    fontSize: 120,
    fontWeight: 'bold',
    marginBottom: 0,
  },

  smallText: {
    fontSize: 20,
    marginBottom: 5,
    fontWeight: 'bold',
  },

  speedUnitText: {
    fontSize: 30,
    bottom: 10,
  },

  unitText: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 20,
    //bottom: 10,
    includeFontPadding: false
  },

})