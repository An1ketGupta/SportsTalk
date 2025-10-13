"use client";

import Footer from "@/components/footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import tennisMatchesHandler from "@/app/handlers/sports/tennis";
import category from "../../../public/sportsCategory"


export default function LiveMatches() {
  const [selectedCategory, setSelectedCategory] = useState("Tennis");
  const [matchData, setMatchData] = useState<any[]>([]);

  useEffect(() => {
    async function HandlerCaller() {
      const response = await tennisMatchesHandler();
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
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6">
        {matchData.length === 0 ? (
          <p className="text-center text-gray-500">Fetching live data...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {matchData.map((match) => (
              <div
                key={match.id}
                className="bg-[#181818] rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border border-white/5 p-5"
              >
                {/* Tournament */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {match.tournament?.name || "Unknown Tournament"}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-md bg-gray-700 text-gray-300">
                    {match.groundType || "Indoor"}
                  </span>
                </div>

                {/* Teams + Score */}
                <div className="flex flex-col items-center gap-3">
                  {/* Home */}
                  <div className="font-medium text-center text-white">
                    {match.homeTeam?.shortName || match.homeTeam?.name}
                    {match.homeTeam?.country && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({match.homeTeam.country.alpha2})
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-2xl font-bold text-blue-500 tracking-wide">
                    {match.homeScore?.current ?? 0} - {match.awayScore?.current ?? 0}
                  </div>

                  {/* Away */}
                  <div className="font-medium text-center text-white">
                    {match.awayTeam?.shortName || match.awayTeam?.name}
                    {match.awayTeam?.country && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({match.awayTeam.country.alpha2})
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Info */}
                <div className="text-xs sm:text-sm text-gray-400 mt-3 flex flex-wrap justify-center gap-4">
                  <span>Round: {match.roundInfo?.name || "-"}</span>
                  <span>Status: {match.status?.description || "Live"}</span>
                  <span>
                    Points: {match.homeScore?.point || "0"} - {match.awayScore?.point || "0"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
