"use client";

import Footer from "@/components/footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import category from "../../../public/sportsCategory";
import {CricketMatchesHandler} from "@/app/handlers/sports/cricket";

export default function LiveMatches() {
  const [selectedCategory, setSelectedCategory] = useState("Cricket");
  const [matchData, setMatchData] = useState<any[]>([]);

  useEffect(() => {
    async function HandlerCaller() {
      const response = await CricketMatchesHandler();

      const matches: any[] = [];
      response.forEach((matchTypeObj: any) => {
        matchTypeObj.seriesMatches.forEach((seriesWrapper: any) => {
          seriesWrapper.seriesAdWrapper.matches.forEach((match: any) => {
            matches.push(match);
          });
        });
      });

      setMatchData(matches);
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
      <div  className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchData.length === 0 ? (
          <p>Loading matches...</p>
        ) : (
          matchData.map((match: any) => {
            const info = match.matchInfo;
            const venue = info.venueInfo;
            const startDate = new Date(Number(info.startDate));

            const formattedDate = startDate.toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            const formattedTime = startDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            // Scores (safe optional chaining)
            const team1Innings = match.matchScore?.team1Score?.inngs1;
            const team2Innings = match.matchScore?.team2Score?.inngs1;

            const team1Score = team1Innings
              ? `${team1Innings.runs}/${team1Innings.wickets} (${team1Innings.overs} ov)`
              : "-";
            const team2Score = team2Innings
              ? `${team2Innings.runs}/${team2Innings.wickets} (${team2Innings.overs} ov)`
              : "-";

            return (
              <a key={info.matchId}
                href={`/livematches/cricket/${info.matchId}`}
                className="border rounded-lg shadow p-4 flex flex-col gap-2 bg-gray-900"
              >
                {/* Series Name */}
                <p className="text-sm text-gray-400 font-medium">{info.seriesName}</p>
                <p className="text-xs italic text-gray-500">{info.matchDesc}</p>

                {/* Teams */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{info.team1.teamName}</span>
                  <span className="font-bold">{team1Score}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold">{info.team2.teamName}</span>
                  <span className="font-bold">{team2Score}</span>
                </div>

                {/* Match Status */}
                <p className="text-xs text-blue-400">{info.status}</p>

                {/* Venue */}
                <p className="text-sm text-gray-500">
                  📍 {venue?.ground ?? "Venue TBA"} - {venue?.city ?? ""}
                </p>

                {/* Date & Time */}
                <p className="text-sm text-gray-500">
                  🗓 {formattedDate} – {formattedTime}
                </p>
              </a>
            );
          })
        )}
      </div>

      <Footer />
    </div>
  );
}
