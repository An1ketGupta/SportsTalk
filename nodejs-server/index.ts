import { createServer } from "http";
import { Server, Socket } from "socket.io";

const httpserver = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SportsTalk Socket Server is Running!');
});

const io = new Server(httpserver, {
    cors: {
        // Replace with your actual Vercel frontend URL
        origin: "https://letsportstalk.vercel.app",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket: Socket) => {
    console.log(socket.id + " have joined the server.")

    socket.on("joinroom", (roomid: string) => {
        socket.join(roomid)
        console.log("Joined the room: " + roomid)
    })

    socket.on("message", (data: any) => {
        console.log("got the message: " + data.message)
        const roomid = data.roomid
        socket.to(roomid).emit("receivedmessage", (data.message))
    })

    socket.on("disconnect", () => {
        console.log("You have disconnected from the server.")
    })
})

const PORT = process.env.PORT || 3001; // Use Render's port, or 3001 locally

httpserver.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});