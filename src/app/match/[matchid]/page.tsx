"use client"

import BasketballMatchesHandler from "@/app/api/handlers/sports/basketball";
import CricketMatchesHandler from "@/app/api/handlers/sports/cricket";
import F1MatchesHandler from "@/app/api/handlers/sports/f1";
import FootballMatchesHandler from "@/app/api/handlers/sports/football";
import HocketMatchesHandler from "@/app/api/handlers/sports/hockey";
import MMAMatchesHandler from "@/app/api/handlers/sports/mma";
import NBAMatchesHandler from "@/app/api/handlers/sports/nba";
import { NFLMatchesHandler } from "@/app/api/handlers/sports/nfl";
import TennisMatchesHandler from "@/app/api/handlers/sports/tennis";
import ChatBox from "@/components/ui/chatbox";
import { JSX, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client"

export default function Match({ params }: any) {
    const [loading, setLoading] = useState<boolean>(false);
    const socketref = useRef<Socket>(null)
    const [matchId, setMatchId] = useState<string | null>()
    const [messages, setmessages] = useState<Array<{ text: string; type: "sent" | "received" }>>([])
    const [sendmessage, setSendMessage] = useState<string>("")
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const [MatchesDiv, setMatchesDiv] = useState<JSX.Element | null>(null);

    // Creating the socket client useEffect
    useEffect(() => {
        const socket = io("http://localhost:3001");
        socketref.current = socket
        async function getMatchId() {
            const matchId = (await params).matchid
            setMatchId(matchId)
        }
        getMatchId()
    }, [])

    // The socket message Handler
    useEffect(() => {
        if (matchId) {
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

    // scroll useEffect
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages])


    // Scorecard useEffect
    useEffect(() => {
        async function MatchesHandler() {
        setLoading(true);
          if(matchId){
            let response:JSX.Element = <></>;
            const helper = matchId.slice(0,2)
            if(helper === "nf"){
              try{
                // @ts-ignore
                  response = await NFLMatchesHandler({id:matchId.slice(2,8)});
                } catch (err) {
                  console.error("Error fetching matches:", err);
                }
            }
            else if(helper === "cr"){
              try {
                  response = await CricketMatchesHandler();
                } catch (err) {
                  console.error("Error fetching matches:", err);
                }
            }
            else if(helper === "ft"){
              try {
                  response = await FootballMatchesHandler();
                } catch (err) {
                  console.error("Error fetching matches:", err);
                }
            }
            else if(helper === "nb"){
              try {
                  response = await NBAMatchesHandler();
                } catch (err) {
                  console.error("Error fetching matches:", err);
                }
            }
            else if(helper === "tn"){
              try {
                  response = await TennisMatchesHandler();
                } catch (err) {
                  console.error("Error fetching matches:", err);
                }
            }
            else if(helper === "bb"){
              try {
                  response = await BasketballMatchesHandler();
                } catch (err) {
                  console.error("Error fetching matches:", err);
                }
            }
            else if(helper === "f1"){
              try {
                  response = await F1MatchesHandler();
                } catch (err) {
                  console.error("Error fetching matches:", err);
                }
            }
            else if(helper === "mm"){
              try {
                  response = await MMAMatchesHandler();
                } catch (err) {
                  console.error("Error fetching matches:", err);
                }
            }
            else if(helper === "ho"){
              try {
                  response = await HocketMatchesHandler();
                } catch (err) {
                  console.error("Error fetching matches:", err);
                }
            }
            setMatchesDiv(response);
            setLoading(false);
          }
        }
    
        MatchesHandler();
      }, [matchId]);

    async function handleSendMessage() {
        const trimmed = sendmessage.trim()
        if (!trimmed || !matchId) return

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
        <div className="flex">
        <div className="max-w-7xl mx-auto w-full px-6 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <div className="h-6 w-6 rounded-full border-2 border-gray-500 border-t-transparent animate-spin mb-3" />
              <p className="text-sm">Loading games...</p>
            </div>
          ) : MatchesDiv ? (
            <div className="space-y-6">
              {MatchesDiv}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-gray-400">No matches available.</p>
            </div>
          )}
        </div>
            <ChatBox matchId={matchId}
                messages={messages}
                messagesEndRef={messagesEndRef}
                sendmessage={sendmessage}
                setSendMessage={setSendMessage}
                handleSendMessage={handleSendMessage} />
        </div>
    );
}