"use client";

import Footer from "@/components/footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import category from "../../../public/sportsCategory";
import hockeyMatchesHandler from "@/app/handlers/sports/hockey";

export default function LiveMatches() {
  const [selectedCategory, setSelectedCategory] = useState("Hockey");
  const [matchData, setMatchData] = useState<any[]>([]);

  useEffect(() => {
    async function HandlerCaller() {
      const response = await hockeyMatchesHandler();
      setMatchData(Array.isArray(response) ? response : []);
    }
    HandlerCaller();
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-md px-6 py-6 border-b border-white/10">
        <h1 className="text-4xl font-extrabold italic tracking-tight">Live Matches</h1>
        <p className="text-sm text-[#cfd2cc] mt-1 max-w-xl">
          Follow live scores and join real-time discussions with fans worldwide.
        </p>

        {/* Categories */}
        <div className="mt-5 flex flex-wrap gap-3">
          {category.map((cat) => (
            <Link
              href={`./${cat.toLowerCase()}`}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
            >
              {cat.replace("_", " ")}
            </Link>
          ))}
        </div>
      </div>

      {/* Matches */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchData.length === 0 ? (
          <p>Loading Hockey games...</p>
        ) : (
          matchData.map((game: any) => {
            const gameDate = new Date(game.date);
            const formattedDate = gameDate.toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            const formattedTime = gameDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={game.id}
                className="border rounded-lg shadow p-4 flex flex-col gap-2 bg-gray-900"
              >
                {/* League & Country */}
                <p className="text-sm text-gray-400 font-medium">
                  🏒 {game.league.name} ({game.country.name})
                </p>

                {/* Date & Time */}
                <p className="text-sm text-gray-500">
                  🗓 {formattedDate} – {formattedTime} ({game.timezone})
                </p>

                {/* Teams & Scores */}
                <div className="flex items-center justify-between mt-2">
                  {/* Home Team */}
                  <div className="flex flex-col items-center">
                    <img
                      src={game.teams.home.logo}
                      alt={game.teams.home.name}
                      className="w-12 h-12 object-contain mb-1"
                    />
                    <span className="text-sm font-semibold">{game.teams.home.name}</span>
                    <span className="text-lg font-bold mt-1">{game.scores.home}</span>
                  </div>

                  <span className="text-xl font-bold">VS</span>

                  {/* Away Team */}
                  <div className="flex flex-col items-center">
                    <img
                      src={game.teams.away.logo}
                      alt={game.teams.away.name}
                      className="w-12 h-12 object-contain mb-1"
                    />
                    <span className="text-sm font-semibold">{game.teams.away.name}</span>
                    <span className="text-lg font-bold mt-1">{game.scores.away}</span>
                  </div>
                </div>

                {/* Status */}
                <p className="text-xs text-blue-400 mt-2">Status: {game.status.long}</p>

                {/* Period Scores */}
                <div className="text-xs text-gray-400 mt-1">
                  <p>1st: {game.periods.first}</p>
                  <p>2nd: {game.periods.second}</p>
                  <p>3rd: {game.periods.third}</p>
                  {game.periods.overtime && <p>OT: {game.periods.overtime}</p>}
                  {game.periods.penalties && <p>Penalties: {game.periods.penalties}</p>}
                </div>
              </div>
            );
          })
        )}
      </main>

      <Footer />
    </div>
  );
}
