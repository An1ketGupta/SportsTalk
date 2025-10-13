"use client";

import Footer from "@/components/footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import basketballMatchesHandler from "@/app/handlers/sports/basketball";
import category from "@/public/sportsCategory";

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
    <div className="w-full h-screen bg-[#0f0f0f] text-white">
      <div className="w-full border-none overflow-y-auto scrollbar-hide px-4 sm:px-6">
        <div className="sticky top-0 bg-black/20 backdrop-blur-md border-none py-6">
          <h1 className="text-3xl font-extrabold italic">Live Matches</h1>
          <p className="text-sm text-[#cfd2cc] mt-1 max-w-2xl">
            Follow live scores and join real-time discussions with fellow sports fans
          </p>

          {/* Categories */}
          <div className="mt-4 bg-[#181818] px-4 py-3 rounded-xl flex flex-wrap gap-3 overflow-x-auto">
            {category.map((cat) => (
              <Link
                href={`./${cat.toLowerCase()}`}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1 rounded-full transition ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Matches Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 pb-20">
          {matchData.length > 0 ? (
            matchData.map((match: any) => (
              <div
                key={match.id}
                className="bg-[#181818] rounded-xl p-4 shadow-md hover:shadow-lg transition"
              >
                {/* Arena and Status */}
                <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                  <span>{match.arena?.name}</span>
                  <span
                    className={`${
                      match.status.long === "Finished"
                        ? "text-green-500"
                        : "text-yellow-400"
                    }`}
                  >
                    {match.status.long}
                  </span>
                </div>

                {/* Teams */}
                <div className="flex items-center justify-between gap-3">
                  {/* Visitor */}
                  <div className="flex flex-col items-center w-1/3">
                    <img
                      src={match.teams.visitors.logo}
                      alt={match.teams.visitors.name}
                      className="w-12 h-12 object-contain"
                    />
                    <p className="text-sm font-semibold text-center mt-1">
                      {match.teams.visitors.nickname}
                    </p>
                    <p className="text-lg font-bold">{match.scores.visitors.points ?? "-"}</p>
                  </div>

                  <span className="text-gray-400 font-bold">VS</span>

                  {/* Home */}
                  <div className="flex flex-col items-center w-1/3">
                    <img
                      src={match.teams.home.logo}
                      alt={match.teams.home.name}
                      className="w-12 h-12 object-contain"
                    />
                    <p className="text-sm font-semibold text-center mt-1">
                      {match.teams.home.nickname}
                    </p>
                    <p className="text-lg font-bold">{match.scores.home.points ?? "-"}</p>
                  </div>
                </div>

                {/* Date */}
                <p className="text-xs text-gray-500 text-center mt-3">
                  {new Date(match.date.start).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 col-span-3 text-center">
              No matches available
            </p>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
