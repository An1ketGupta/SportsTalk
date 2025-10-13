"use client";

import Footer from "@/components/footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import category from "../../../public/sportsCategory";
import mmaMatchesHandler from "@/app/handlers/sports/mma";

export default function LiveMatches() {
  const [selectedCategory, setSelectedCategory] = useState("MMA");
  const [matchData, setMatchData] = useState<any[]>([]);

  useEffect(() => {
    async function HandlerCaller() {
      const response = await mmaMatchesHandler();
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {matchData.length > 0 ? (
          matchData.map((fight: any) => (
            <div
              key={fight.id}
              className="bg-[#1a1a1a] rounded-2xl p-5 shadow-lg border border-white/10 hover:scale-[1.02] transition-transform"
            >
              {/* Event Info */}
              <p className="text-xs text-gray-400 mb-2">
                {new Date(fight.date).toLocaleString()} • {fight.category}
              </p>
              <h2 className="text-lg font-bold text-white mb-4">
                {fight.slug}
              </h2>

              {/* Fighters */}
              <div className="flex items-center justify-between gap-3">
                {/* First Fighter */}
                <div className="flex-1 flex flex-col items-center">
                  <img
                    src={fight.fighters.first.logo}
                    alt={fight.fighters.first.name}
                    className="w-14 h-14 object-contain mb-2"
                  />
                  <p
                    className={`text-sm font-semibold ${
                      fight.fighters.first.winner ? "text-green-400" : "text-gray-300"
                    }`}
                  >
                    {fight.fighters.first.name}
                  </p>
                </div>

                {/* VS */}
                <div className="text-gray-400 font-bold">VS</div>

                {/* Second Fighter */}
                <div className="flex-1 flex flex-col items-center">
                  <img
                    src={fight.fighters.second.logo}
                    alt={fight.fighters.second.name}
                    className="w-14 h-14 object-contain mb-2"
                  />
                  <p
                    className={`text-sm font-semibold ${
                      fight.fighters.second.winner ? "text-green-400" : "text-gray-300"
                    }`}
                  >
                    {fight.fighters.second.name}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 text-center">
                <span className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                  {fight.status.long}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No matches available</p>
        )}
      </div>

      <Footer />
    </div>
  );
}
