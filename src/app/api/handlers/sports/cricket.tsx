import React from 'react';
import axios from 'axios';
export default async function CricketMatchesHandler() {

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/matches/live',
    headers: {
      'x-apihub-key': "XZmTq6fV04Hz3jKAhkSKbKxuWGDzdczt6yMTRHTM11HTmAKqci",
      'x-apihub-host': "Cricbuzz-Official-Cricket-API.allthingsdev.co",
      'x-apihub-endpoint': "e0cb5c72-38e1-435e-8bf0-6b38fbe923b7",
    }
  };

  const response = await axios.request(config)
  const response2 = await response.data.typeMatches
  const matches: any[] = [];
  response2.forEach((matchTypeObj: any) => {
    matchTypeObj.seriesMatches.forEach((seriesWrapper: any) => {
      seriesWrapper.seriesAdWrapper.matches.forEach((match: any) => {
        matches.push(match);
      });
    });
  });

  return (
    <div className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {matches.length === 0 ? (
        <div className="col-span-full text-center py-20">
          <div className="text-gray-400 text-lg font-medium">Loading cricket matches...</div>
          <p className="text-gray-500 text-sm mt-2">Fetching live scores and match data</p>
        </div>
      ) : (
        matches.map((match: any) => {
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
              href={`../match/cr${info.matchId}`}
              className="group bg-[#181818] hover:bg-[#1f1f1f] border border-white/5 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col"
            >
              {/* Series Info */}
              <div className="text-center mb-4">
                <div className="text-sm font-medium text-orange-400 mb-1">
                  🏏 {info.seriesName || 'Cricket Match'}
                </div>
                <p className="text-xs text-gray-400 italic">{info.matchDesc || 'Match Description'}</p>
              </div>

              {/* Teams & Scores */}
              <div className="space-y-3 mb-4">
                {/* Team 1 */}
                <div className="flex justify-between items-center bg-gray-800/50 rounded-lg p-3">
                  <span className="font-semibold text-white text-sm">{info.team1.teamName}</span>
                  <span className="font-bold text-green-400 text-sm">{team1Score}</span>
                </div>

                {/* Team 2 */}
                <div className="flex justify-between items-center bg-gray-800/50 rounded-lg p-3">
                  <span className="font-semibold text-white text-sm">{info.team2.teamName}</span>
                  <span className="font-bold text-green-400 text-sm">{team2Score}</span>
                </div>
              </div>

              {/* Match Details */}
              <div className="space-y-2 text-xs text-gray-400 mb-4">
                {/* Venue */}
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{venue?.ground ?? "Venue TBA"}{venue?.city ? `, ${venue.city}` : ""}</span>
                </div>
                
                {/* Date & Time */}
                <div className="flex items-center gap-2">
                  <span>🗓</span>
                  <span>{formattedDate} – {formattedTime}</span>
                </div>
              </div>

              {/* Status */}
              <div className="text-center mt-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-400/20">
                  {info.status || 'Live'}
                </span>
              </div>
            </a>
          );
        })
      )}
    </div>
  );
}
