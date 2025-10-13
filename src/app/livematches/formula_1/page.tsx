"use client";

import Footer from "@/components/footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import category from "../../../public/sportsCategory";
import F1MatchesHandler from "@/app/handlers/sports/f1";

export default function LiveMatches() {
  const [selectedCategory, setSelectedCategory] = useState("Formula_1");
  const [matchData, setMatchData] = useState<any[]>([]);

  useEffect(() => {
    async function HandlerCaller() {
      const response = await F1MatchesHandler();
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
          <p>Loading F1 races...</p>
        ) : (
          matchData.map((race: any) => {
            const date = new Date(race.date);
            const formattedDate = date.toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            const formattedTime = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={race.id}
                className="border rounded-lg shadow p-4 flex flex-col gap-2 bg-gray-900"
              >
                {/* Race Name */}
                <p className="text-sm text-gray-400 font-medium">{race.competition.name}</p>

                {/* Circuit */}
                <div className="flex items-center gap-2">
                  {race.circuit.image && (
                    <img src={race.circuit.image} alt={race.circuit.name} className="w-10 h-10 object-contain" />
                  )}
                  <span className="font-semibold">{race.circuit.name}</span>
                </div>

                {/* Laps & Distance */}
                <p className="text-sm text-gray-500">
                  🏁 Laps: {race.laps.total} | Distance: {race.distance}
                </p>

                {/* Date & Time */}
                <p className="text-sm text-gray-500">
                  🗓 {formattedDate} – {formattedTime} (UTC)
                </p>

                {/* Status */}
                <p className="text-xs text-blue-400">Status: {race.status}</p>

                {/* Fastest Lap */}
                {race.fastest_lap && (
                  <p className="text-xs text-green-400">
                    ⚡ Fastest Lap: {race.fastest_lap.time} by Driver {race.fastest_lap.driver.id}
                  </p>
                )}

                {/* Location */}
                <p className="text-sm text-gray-500">
                  📍 {race.competition.location.city}, {race.competition.location.country}
                </p>
              </div>
            );
          })
        )}
      </main>

      <Footer />
    </div>
  );
}
