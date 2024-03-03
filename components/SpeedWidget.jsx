import { View, Text, StyleSheet, Dimensions, ProgressBar, TextInput, TouchableOpacity } from "react-native"
const { width, height } = Dimensions.get("window");
import Svg, { Path } from 'react-native-svg';
import React, {useState, useEffect} from 'react';
import { Stopwatch, Timer } from 'react-native-stopwatch-timer'



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

export default function SpeedWidget({socket}) {
  // speedometer 
  const [speed, setSpeed] = useState("0"); // initial value
  const [speedBarWidth, setSpeedBarWidth] = useState('0%');
  const [speedBarColor, setSpeedBarColor] = useState(startColor);

  useEffect(() => { // Update speedBarWidth and speedBarColor
    const newWidth = `${(Math.max(0, Math.min(speed, maxSpeed)) / maxSpeed) * 98}%`;
    const newColor = interpolateColor(speed, 0, maxSpeed, startColor, endColor);
    
    setSpeedBarWidth(newWidth);
    setSpeedBarColor(newColor);
  }, [speed]); 

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };
  const updateSpeed=()=> { // for updating speed on client side & emitting to server
    const serverSpeed = speed; // replace w/ server value got from API call or HTTP request
    setSpeed(serverSpeed);
    if (socket) {
      socket.emit("updateSpeed", {speed: serverSpeed}) // submit event to server
    }
  };

  // stopwatch implementation 
  const [lapTime, setLapTime] = useState(0);
  const [lapData, setLapData] = useState([]);
  const [totalTime, setTotalTime] = useState(0);
  const [isStopwatchStart, setIsStopwatchStart] = useState(false);
  const [resetStopwatch, setResetStopwatch] = useState(false);


  const handleLapPress = () => {
    // Save the lap time and reset the stopwatch
    setLapTime(lapTime + totalTime);
    //setResetStopwatch(true);
  };

  const handleTotalTimePress = (time) => {
    setIsStopwatchStart(!isStopwatchStart);
  if (!isStopwatchStart) {
    // If Stopwatch is stopping, reset should be false
    setResetStopwatch(false);
  }
};

   
  

  return (
    <View style={styles.speed}>
      <View style={styles.speedCircle}>
      <TextInput
         style={styles.speedText}
         value = {speed}
         onSubmitEditing = {() => updateSpeed()}
         onChangeText = {speed => {
          handleSpeedChange({speed})
         }}
         
         keyboardType = "numeric"/>
        {/* <Text style={styles.speedText}>{Math.floor(speed)}</Text>  */}
        <Text style={styles.speedUnitText}>mph</Text>
      </View>
      <View style={styles.lapMinCircle}>
        <Text style={styles.smallText}>10:40</Text> 
        <Text style={styles.unitText}>mins/lap</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: speedBarWidth }, { backgroundColor: speedBarColor }]} />
      </View>
      <View style={styles.totalTimeCircle}>
        {/* <Text style={styles.smallText}>12:55</Text>  */}
        {/* <Text style={styles.unitText}>total mins</Text> */}
      </View>
      
      <TouchableOpacity onPress={handleLapPress} style={styles.lapMinCircle}>
        {/* <Text style={styles.smallText}>{formatTime(lapTime)}</Text> */}
        <Text style={styles.unitText}>Lap</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleTotalTimePress} style={styles.totalTimeCircle}>
        <Text style={styles.smallText}>{formatTime(totalTime)}</Text>
        {isStopwatchStart ? (
          <Stopwatch
            laps
            msecs
            start
            reset={resetStopwatch}
            getTime={(time) => setTotalTime(time)}
            options={options}
          />
        ) : null}
        <Text style={styles.unitText}>{isStopwatchStart ? "Reset" : "Start"}</Text>
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

  const formattedTime = `${pad(hr)}:${pad(min % 60)}:${pad(sec % 60)}`;
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
    fontSize: 20,
    bottom: 10,
  },

})