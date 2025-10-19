"use client"

import ChatBox from "@/components/ui/chatbox";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client"

export default function Match({ params }: any) {
    const socketref = useRef<Socket>(null)
    const [matchId, setMatchId] = useState<string | null>(null)
    const [messages, setmessages] = useState<Array<{ text: string; type: "sent" | "received" }>>([])
    const [sendmessage, setSendMessage] = useState<string>("")
    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const socket = io("http://localhost:3001");
        socketref.current = socket
        async function getMatchId() {
            const matchId = (await params).matchid
            setMatchId(matchId)
        }
        getMatchId()
    }, [])

    useEffect(() => {
        if (matchId) {
            console.log(matchId)
            socketref.current?.emit("joinroom", matchId);

            socketref.current?.on("receivedmessage", (message: string) => {
                setmessages((prevmessage) => [...prevmessage, { text: message, type: "received" }])
            })

            return () => {
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
        <ChatBox matchId={matchId}
            messages={messages}
            messagesEndRef={messagesEndRef}
            sendmessage={sendmessage}
            setSendMessage={setSendMessage}
            handleSendMessage={handleSendMessage} />
    );
}