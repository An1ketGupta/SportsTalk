"use client";

import Footer from "@/components/footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import category from "../../../public/sportsCategory";
import {basketballMatchesHandler} from "@/app/handlers/sports/basketball";

export default function LiveMatches() {
  const [selectedCategory, setSelectedCategory] = useState("Basketball");
  const [matchData, setMatchData] = useState<any[]>([]);

  useEffect(() => {
    async function HandlerCaller() {
      const response = await basketballMatchesHandler();
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
      <div className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchData.length === 0 && (
          <div className="text-gray-400 col-span-full text-center py-20">
            No live matches available
          </div>
        )}

        {matchData.map((match) => (
          <a href={`/livematches/basketball/${match.id}`} key={match.id} className="bg-gray-900 p-4 rounded-lg shadow-md flex flex-col items-center">
            <div className="text-sm text-gray-400 mb-2">
              {match.league?.name} - {match.date?.split("T")[0]}
            </div>

            <div className="flex justify-between w-full items-center mb-2">
              {/* Home Team */}
              <div className="flex flex-col items-center">
                {match.teams?.home?.logo && (
                  <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-12 h-12 mb-1" />
                )}
                <div className="font-bold">{match.teams?.home?.name}</div>
                <div className="text-lg">{match.scores?.home?.total ?? 0}</div>
              </div>

              <div className="text-gray-300 font-semibold">vs</div>

              {/* Away Team */}
              <div className="flex flex-col items-center">
                {match.teams?.away?.logo && (
                  <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-12 h-12 mb-1" />
                )}
                <div className="font-bold">{match.teams?.away?.name}</div>
                <div className="text-lg">{match.scores?.away?.total ?? 0}</div>
              </div>
            </div>

            <div className="text-sm text-gray-300">{match.status?.short}</div>
          </a>
        ))}
      </div>

      <Footer />
    </div>
  );
}
