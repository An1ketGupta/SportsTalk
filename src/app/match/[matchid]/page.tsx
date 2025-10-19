"use client"

import ChatBox from "@/components/ui/chatbox";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client"

export default function Match({ params }: any) {
    const socketref = useRef<Socket>(null)
    const [matchId , setMatchId] = useState<string|null>(null)
    const [messages, setmessages] = useState<Array<{ text: string; type: "sent" | "received" }>>([])
    const [sendmessage, setSendMessage] = useState<string>("")
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    
    useEffect(()=>{
        const socket = io("http://localhost:3001");
        socketref.current = socket
        async function getMatchId(){
            const matchId =(await params).matchid
            setMatchId(matchId)
        }
        getMatchId()
    },[])

    useEffect(() => {
        if(matchId){
            console.log(matchId)
            socketref.current?.emit("joinroom", matchId);
            
            socketref.current?.on("receivedmessage", (message: string) => {
                setmessages((prevmessage) => [...prevmessage, { text: message, type: "received" }])
            })
            
            return ()=>{
                socketref.current?.off("receivedmessage")
                socketref.current?.disconnect()
            }
        }
    }, [matchId])

    // Auto scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages])

    async function handleSendMessage() {
        const trimmed = sendmessage.trim()
        if (!trimmed || !matchId) return

        // Optimistically render the sent message
        setmessages((prev) => [...prev, { text: trimmed, type: "sent" }])

        socketref.current?.emit(
            "message",
            {
                roomid: matchId,
                message: trimmed,
            },
            () => {
                console.log("Sent the message :", trimmed)
            }
        )
        setSendMessage("")
    }

    return (
    // <div className="flex flex-col h-[88vh] items-center px-4">
    //   <div className="w-full max-w-2xl h-full flex flex-col border border-gray-800 rounded-2xl bg-black/60 shadow-xl">
    //     {/* Header */}
    //     <div className="p-4 border-b border-gray-800 flex items-center justify-between">
    //       <div className="text-lg font-semibold">Live Chat</div>
    //       {matchId ? <div className="text-xs text-gray-400">Room: {matchId}</div> : null}
    //     </div>

    //     {/* Messages */}
    //     <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
    //       {messages.length === 0 && (
    //         <p className="text-gray-500 text-sm text-center">No messages yet. Start the chat!</p>
    //       )}
    //       {messages.map((msg, i) => {
    //         const isSent = msg.type === "sent"
    //         return (
    //           <div key={i} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
    //             <div
    //               className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm border ${
    //                 isSent
    //                   ? "bg-blue-600 text-white border-blue-500"
    //                   : "bg-gray-900 text-gray-100 border-gray-800"
    //               }`}
    //             >
    //               {msg.text}
    //             </div>
    //           </div>
    //         )
    //       })}
    //       <div ref={messagesEndRef} />
    //     </div>

    //     {/* Input */}
    //     <div className="p-4 border-t border-gray-800 flex items-center gap-2">
    //       <input
    //         type="text"
    //         placeholder="Type your message..."
    //         value={sendmessage}
    //         onChange={(e) => setSendMessage(e.target.value)}
    //         onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
    //         className="flex-1 px-4 py-2 rounded-xl bg-gray-900 text-white placeholder:text-gray-500 outline-none border border-gray-800 focus:border-blue-600"
    //       />
    //       <button
    //         onClick={handleSendMessage}
    //         disabled={!sendmessage.trim()}
    //         className="px-4 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    //       >
    //         Send
    //       </button>
    //     </div>
    //   </div>
    // </div>
    <ChatBox matchId={matchId} messages={messages} messagesEndRef={messagesEndRef} sendmessage={sendmessage} setSendMessage={setSendMessage} handleSendMessage={handleSendMessage}/>
  );
}