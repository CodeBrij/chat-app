import {Server} from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },
});

export function getRecieverSocketId(userId){
    return userSocketMap[userId];
}

//to store online users
const userSocketMap = {} // {userId: socketId};

io.on("connection", (socket) => {
    console.log("User is connected ID: ", socket.id);

    const userId = socket.handshake.query.userId; //getting the user _id
    if(userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User is disconnected ID: ", socket.id);
        delete userSocketMap[userId];
    });
});

export { io, app, server};
