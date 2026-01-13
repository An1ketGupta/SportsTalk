"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const httpserver = (0, http_1.createServer)((req, res) => {
    // If someone calls the root URL, say "I am alive"
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SportsTalk Socket Server is Running!');
});
const io = new socket_io_1.Server(httpserver, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
io.on("connection", (socket) => {
    console.log(socket.id + " have joined the server.");
    socket.on("joinroom", (roomid) => {
        socket.join(roomid);
        console.log("Joined the room: " + roomid);
    });
    socket.on("message", (data) => {
        console.log("got the message: " + data.message);
        const roomid = data.roomid;
        socket.to(roomid).emit("receivedmessage", (data.message));
    });
    socket.on("disconnect", () => {
        console.log("You have disconnected from the server.");
    });
});
httpserver.listen(3001, "0.0.0.0", () => {
    console.log("Server is running on port 3001");
});
