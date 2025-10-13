"use client";

import Footer from "@/components/footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import CricketMatchesHandler from "@/app/handlers/sports/cricket";
import category from "@/public/sportsCategory";

export default function LiveMatches() {
  const [selectedCategory, setSelectedCategory] = useState("Cricket");
  const [matchData, setMatchData] = useState<any[]>([]);

  useEffect(() => {
    async function HandlerCaller() {
      const response = await CricketMatchesHandler();
      setMatchData(Array.isArray(response) ? response : []);
    }
    HandlerCaller();
  }, []);

  return (
    <div className="w-full h-screen bg-[#0f0f0f] text-white">
      {/* Main Content full width */}
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
                className={`px-4 py-1 rounded-full transition ${selectedCategory === cat
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                {cat}
              </Link>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 pb-20">
            {matchData.map((seriesWrapper: any) => {
              const series = seriesWrapper.seriesAdWrapper;
              return series.matches.map((matchWrapper: any) => {
                const match = matchWrapper.matchInfo;
                const score = matchWrapper.matchScore;

                return (
                  <div
                    key={match.matchId}
                    className="bg-[#262626] p-4 rounded-xl shadow-md flex flex-col gap-3"
                  >
                    {/* Series Name */}
                    <p className="text-sm text-gray-400">{series.seriesName}</p>

                    {/* Teams */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center">
                        <p className="font-bold">{match.team1.teamSName}</p>
                        {score?.team1Score && (
                          <p className="text-xs text-gray-400 text-center">
                            {Object.values(score.team1Score)
                              .map(
                                (inngs: any) =>
                                  `${inngs.runs}/${inngs.wickets} (${inngs.overs} ov)`
                              )
                              .join(" | ")}
                          </p>
                        )}
                      </div>

                      <span className="text-white font-bold text-lg">vs</span>

                      <div className="flex flex-col items-center">
                        <p className="font-bold">{match.team2.teamSName}</p>
                        {score?.team2Score && (
                          <p className="text-xs text-gray-400 text-center">
                            {Object.values(score.team2Score)
                              .map(
                                (inngs: any) =>
                                  `${inngs.runs}/${inngs.wickets} (${inngs.overs} ov)`
                              )
                              .join(" | ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Match Info */}
                    <div className="text-center mt-2">
                      <p className="text-sm text-gray-500">{match.matchDesc}</p>
                      <p className="text-sm text-gray-500">{match.matchFormat}</p>
                      <p className="text-green-400 font-medium mt-1">{match.status}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {match.venueInfo.ground}, {match.venueInfo.city}
                      </p>
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
