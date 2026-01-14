import { createServer } from "http";
import { Server, Socket } from "socket.io";

const httpserver = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SportsTalk Socket Server is Running!');
});

const io = new Server(httpserver, {
    cors: {
        // Allow both production and development origins
        origin: ["https://letsportstalk.vercel.app", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket: Socket) => {
    console.log(socket.id + " have joined the server.")

    socket.on("joinroom", (roomid: string) => {
        socket.join(roomid)
        console.log("Joined the room: " + roomid)
    })

    // Handler for joining a private DM room
    socket.on("join-dm", (data: { myUserId: string; otherUserId: string }) => {
        // Create a consistent room ID by sorting user IDs
        const roomId = [data.myUserId, data.otherUserId].sort().join("-");
        socket.join(roomId);
        console.log("Joined DM room: " + roomId);
    })

    // Handler for sending a private DM
    socket.on("send-dm", (data: { myUserId: string; otherUserId: string; message: any }) => {
        const roomId = [data.myUserId, data.otherUserId].sort().join("-");
        // Emit to everyone in the room except sender
        socket.to(roomId).emit("receive-dm", data.message);
        console.log("DM sent in room: " + roomId);
    })

    // Handler for leaving a DM room
    socket.on("leave-dm", (data: { roomId: string }) => {
        socket.leave(data.roomId);
        console.log("Left DM room: " + data.roomId);
    })

    socket.on("message", (data: any) => {
        console.log("got the message: " + data.message + " from: " + data.username)
        const roomid = data.roomid
        socket.to(roomid).emit("receivedmessage", { message: data.message, username: data.username })
    })

    socket.on("disconnect", () => {
        console.log("You have disconnected from the server.")
    })
})

const PORT = process.env.PORT || 3001; // Use Render's port, or 3001 locally

httpserver.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});