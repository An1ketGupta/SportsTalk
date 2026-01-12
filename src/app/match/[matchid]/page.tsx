"use client"

import { BasketballMatchByIdHandler } from "@/app/api/handlers/sports/basketball";
import { CricketMatchByIdHandler } from "@/app/api/handlers/sports/cricket";
import { F1MatchByIdHandler } from "@/app/api/handlers/sports/f1";
import { FootballMatchByIdHandler } from "@/app/api/handlers/sports/football";
import { HockeyMatchByIdHandler } from "@/app/api/handlers/sports/hockey";
import MMAMatchesHandler from "@/app/api/handlers/sports/mma";
import { NBAMatchByIdHandler } from "@/app/api/handlers/sports/nba";
import { NFLMatchByIdHAndler } from "@/app/api/handlers/sports/nfl";
import { TennisMatchByIdHandler } from "@/app/api/handlers/sports/tennis";
import ChatBox from "@/components/ui/chatbox";
import Link from "next/link";
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

  // Get sport type for display
  const getSportInfo = () => {
    if (!matchId) return { name: "Match", emoji: "🏆", color: "blue" };
    const helper = matchId.slice(0, 2);
    const sports: Record<string, { name: string; emoji: string; color: string }> = {
      nf: { name: "NFL", emoji: "🏈", color: "amber" },
      cr: { name: "Cricket", emoji: "🏏", color: "green" },
      fo: { name: "Football", emoji: "⚽", color: "blue" },
      nb: { name: "NBA", emoji: "🏀", color: "orange" },
      tn: { name: "Tennis", emoji: "🎾", color: "emerald" },
      bb: { name: "Basketball", emoji: "🏀", color: "orange" },
      f1: { name: "Formula 1", emoji: "🏎️", color: "red" },
      mm: { name: "MMA", emoji: "🥊", color: "red" },
      ho: { name: "Hockey", emoji: "🏒", color: "cyan" },
    };
    return sports[helper] || { name: "Match", emoji: "🏆", color: "blue" };
  };

  const sportInfo = getSportInfo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            <Link
              href={`/livematches/${sportInfo.name.toLowerCase().replace(" ", "_")}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span className="text-sm font-medium">Back to matches</span>
            </Link>

            {/* Sport Badge */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-${sportInfo.color}-500/10 border border-${sportInfo.color}-500/20`}>
                <span className="text-lg">{sportInfo.emoji}</span>
                <span className={`text-sm font-semibold text-${sportInfo.color}-400`}>{sportInfo.name}</span>
              </div>
              {/* Live Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Live</span>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          {/* Match Details Section */}
          <div className="xl:col-span-7 2xl:col-span-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 bg-gradient-to-br from-gray-900/80 to-gray-900/40 rounded-3xl border border-white/5 backdrop-blur-sm">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-gray-800" />
                  <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                </div>
                <p className="mt-6 text-base text-gray-400 font-medium">Loading match details...</p>
                <p className="mt-2 text-sm text-gray-600">Fetching live data</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {MatchesDiv}
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div className="xl:col-span-5 2xl:col-span-4">
            <div className="sticky top-24">
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
                <ChatBox
                  matchId={matchId}
                  messages={messages}
                  sendmessage={sendmessage}
                  setSendMessage={setSendMessage}
                  handleSendMessage={handleSendMessage}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}