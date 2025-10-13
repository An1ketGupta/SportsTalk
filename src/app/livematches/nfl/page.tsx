"use client";

import Footer from "@/components/footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import category from "../../../public/sportsCategory";
import NFLMatchesHandler from "@/app/handlers/sports/nfl";

export default function LiveMatches() {
  const [selectedCategory, setSelectedCategory] = useState("NFL");
  const [matchData, setMatchData] = useState<any[]>([]);

  useEffect(() => {
    async function HandlerCaller() {
      const response = await NFLMatchesHandler();
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
        {matchData.length === 0 && <p>No matches available.</p>}

        {matchData.map((item) => {
          const { game, league, teams, scores } = item;
          return (
            <div
              key={game.id}
              className="bg-gray-900 rounded-xl p-4 flex flex-col justify-between shadow-md"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg">{league.name} - {game.week}</h2>
                <span className="text-sm text-gray-400">{game.status.long}</span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <div className="flex flex-col items-center">
                  <img src={teams.home.logo} alt={teams.home.name} className="w-12 h-12 mb-1" />
                  <span className="text-center">{teams.home.name}</span>
                </div>

                <div className="text-xl font-bold">
                  {scores.home.total !== null ? `${scores.home.total} - ${scores.away.total}` : "VS"}
                </div>

                <div className="flex flex-col items-center">
                  <img src={teams.away.logo} alt={teams.away.name} className="w-12 h-12 mb-1" />
                  <span className="text-center">{teams.away.name}</span>
                </div>
              </div>

              <div className="text-sm text-gray-400 mt-2">
                <p>{game.date.date} {game.date.time} ({game.date.timezone})</p>
                <p>{game.venue.name}, {game.venue.city}</p>
              </div>
            </div>
          );
        })}
      </main>

      <Footer />
    </div>
  );
}
