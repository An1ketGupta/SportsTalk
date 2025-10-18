"use client"

import { use, useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"


export default function MatchInfoById({ params }: any) {
    const resolvedparams:any = use(params)
    const matchid = resolvedparams.matchid
    const roomid = matchid + "bb"
    
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("")
    const socketref = useRef<Socket>(null)

    useEffect(() => {
        const socket = io("http://localhost:3001")
        socketref.current = socket

        socket.emit("joinroom", (roomid))

        socket.on("receivedmessage" , (content)=>{
            console.log("Recieved :" + content)
            setMessages((prevMessages)=>[...prevMessages,content])
        })
        
        return ()=>{
            socket.disconnect()
        }
    }, [])
    
    function sendMessage(){
        console.log("Sent the message: " + input)
        const messagedata = {"roomid":roomid , "message":input}
        socketref.current?.emit("message" , (messagedata))
    }


    return <div className="h-[90vh] w-full flex items-center">
        <div className="w-[50vw] justify-center flex">
            This is where the match will be shown
        </div>

        {/* Chat box */}
        <div className="h-[80vh] flex flex-col bg-white rounded-lg text-black">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Live Chat</h2>
            </div>

            {/* Messages */}
            <div className="text-black flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 ? (
                    <p className="text-sm">No messages yet. Be the first to chat!</p>
                ) : (
                    messages.map((i) => (
                        <div
                            key={i}
                            className={`p-2 rounded-xl max-w-[80%]`}>
                            {i}
                        </div>
                    ))
                )}
            </div>

            {/* Input box */}
            <div className="p-4 border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-xl px-4 py-2 outline-none"
                />
                <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                >
                    Send
                </button>
            </div>
        </div>
    </div>
}