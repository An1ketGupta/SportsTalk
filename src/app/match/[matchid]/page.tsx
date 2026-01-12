"use client"

import { BasketballMatchByIdHandler } from "@/app/api/handlers/sports/basketball";
import { CricketMatchByIdHandler } from "@/app/api/handlers/sports/cricket";
import { F1MatchByIdHandler } from "@/app/api/handlers/sports/f1";
import FootballMatchesHandler, { FootballMatchByIdHandler } from "@/app/api/handlers/sports/football";
import { HockeyMatchByIdHandler } from "@/app/api/handlers/sports/hockey";
import MMAMatchesHandler from "@/app/api/handlers/sports/mma";
import { NBAMatchByIdHandler } from "@/app/api/handlers/sports/nba";
import { NFLMatchByIdHAndler } from "@/app/api/handlers/sports/nfl";
import { TennisMatchByIdHandler } from "@/app/api/handlers/sports/tennis";
import ChatBox from "@/components/ui/chatbox";
import { JSX, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client"

export default function Match({ params }: any) {
  const [loading, setLoading] = useState<boolean>(false);
  const socketref = useRef<Socket>(null)
  const [matchId, setMatchId] = useState<string | null>()
  const [messages, setmessages] = useState<Array<{ text: string; type: "sent" | "received" }>>([])
  const [sendmessage, setSendMessage] = useState<string>("")
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


  // Scorecard useEffect
  useEffect(() => {
    async function MatchesHandler() {
      setLoading(true);
      if (matchId) {
        let response: JSX.Element = <></>; 

        const helper = matchId.slice(0, 2)
        if (helper === "nf") {
          try {
            response = await NFLMatchByIdHAndler({ id: matchId.slice(2, 8) });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "cr") {
          try {
            response = await CricketMatchByIdHandler({
              id:matchId.slice(2,8)
            });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "fo") {
          try {
            response = await FootballMatchByIdHandler({
              id:matchId.slice(2,9)
            });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "nb") {
          try {
            response = await NBAMatchByIdHandler({
              id:matchId.slice(2,7)
            });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "tn") {
          try {
            response = await TennisMatchByIdHandler({
              id:matchId.slice(2,10)
            });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "bb") {
          try {
            response = await BasketballMatchByIdHandler({
              id:matchId.slice(2,7)
            });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "f1") {
          try {
            response = await F1MatchByIdHandler({
              id:matchId.slice(2,7)
            });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "mm") {
          try {
            response = await MMAMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "ho") {
          try {
            response = await HockeyMatchByIdHandler({
              id:matchId.slice(2,7)
            });
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
    )
    setSendMessage("")
  }

  return (
    <div className="grid grid-cols-7 h-auto p-8 gap-8">
      <div className="col-span-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <div className="h-6 w-6 rounded-full border-2 border-gray-500 border-t-transparent animate-spin mb-3" />
            <p className="text-sm">Loading games...</p>
          </div>
        ) :
          <div>
            {MatchesDiv}
          </div>
        }
      </div>
      <div className="col-span-3">
        <ChatBox matchId={matchId}
          messages={messages}
          sendmessage={sendmessage}
          setSendMessage={setSendMessage}
          handleSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}