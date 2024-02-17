//import TcpSocket from 'react-native-tcp-socket';


import express from "express"; 
import http from "http";

const app = express(); 
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server);
const port = 3000; 

io.on("connection", socket => {
    console.log("user connected!!");

    socket.on("updateSpeed", (data) => {
        console.log("Speed updated:", data.speed);
        console.log("speed value changed!!!");
        io.emit("speedUpdated", {speed: data.speed});

    });
});

server.listen(port, () => console.log("server running on port" + port));
