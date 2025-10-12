"use client";

import Footer from "@/components/footer";
import axios from "axios";
import { useState } from "react";

const categories = [
  "All Sports",
  "Cricket",
  "Football",
  "Basketball",
  "American Football",
  "Tennis",
];

export default function LiveMatches() {
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

  const LiveMatchesHandler = async (cat: string) => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/matches/live",
      headers: {
        "x-apihub-key": "XZmTq6fV04Hz3jKAhkSKbKxuWGDzdczt6yMTRHTM11HTmAKqci",
        "x-apihub-host": "Cricbuzz-Official-Cricket-API.allthingsdev.co",
        "x-apihub-endpoint": "e0cb5c72-38e1-435e-8bf0-6b38fbe923b7",
      },
    };
    try {
      const response = await axios.request(config);

      // Your API returns structure -> typeMatches[x].seriesMatches
      // but since you're testing with provided mock data, set it directly
      setLiveMatches(response.data.typeMatches[0].seriesMatches); // use your mock array here while testing
    } catch (error) {
      console.log(error);
    }
  };

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
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => LiveMatchesHandler(cat)}
                className="bg-black px-4 py-1 rounded-full"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Matches grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 pb-20">
            {liveMatches.map((series: any) => (
              <div
                key={series.seriesAdWrapper.seriesId}
                className="bg-[#181818] p-4 rounded-xl shadow-md"
              >
                <h2 className="text-lg font-bold mb-4">
                  {series.seriesAdWrapper.seriesName}
                </h2>

                {series.seriesAdWrapper.matches.map((match: any) => (
                  <div
                    key={match.matchInfo.matchId}
                    className="border-b border-gray-700 pb-3 mb-3"
                  >
                    <p className="text-sm text-gray-400">
                      {match.matchInfo.matchDesc} •{" "}
                      {match.matchInfo.venueInfo.ground},{" "}
                      {match.matchInfo.venueInfo.city}
                    </p>
                    <p className="text-sm text-green-400 mb-2">
                      {match.matchInfo.status}
                    </p>

                    {/* Teams + Scores */}
                    <div className="flex justify-between items-center gap-8">
                      <div>
                        <p className="font-semibold">
                          {match.matchInfo.team1.teamName} (
                          {match.matchInfo.team1.teamSName})
                        </p>
                        {match.matchScore?.team1Score?.inngs1 && (
                          <p>
                            {match.matchScore.team1Score.inngs1.runs}/
                            {match.matchScore.team1Score.inngs1.wickets} (
                            {match.matchScore.team1Score.inngs1.overs})
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold">
                          {match.matchInfo.team2.teamName} (
                          {match.matchInfo.team2.teamSName})
                        </p>
                        {match.matchScore?.team2Score?.inngs1 && (
                          <p>
                            {match.matchScore.team2Score.inngs1.runs}/
                            {match.matchScore.team2Score.inngs1.wickets} (
                            {match.matchScore.team2Score.inngs1.overs})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
