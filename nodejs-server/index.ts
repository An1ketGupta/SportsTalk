import { createServer } from "http";
import {Server} from "socket.io"

const httpserver = createServer()

const io = new Server(httpserver , {
    cors:{
        origin:"*",
        methods:["GET" ,"POST"]
    }
})

io.on("connection" , (socket)=>{
    console.log(socket.id + " have joined the server.")

    socket.on("joinroom" ,(roomid:string)=>{
        socket.join(roomid)
        console.log("Joined the room: " + roomid)
    })

    socket.on("message", (data)=>{
        console.log("got the message: " + data.message)
        const roomid = data.roomid
        socket.to(roomid).emit("receivedmessage" , (data.message))
    })

    socket.on("disconnect" , ()=>{
        console.log("You have disconnected from the server.")
    })
})

httpserver.listen(3001)