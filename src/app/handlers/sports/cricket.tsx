import React from 'react';

// This is a React Server Component, which is perfect for fetching data.
export default async function CricketMatchesHandler() {
  const url = "https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/matches/live";

  // Check for environment variables at the start for security and clarity
  const apiKey = process.env.CRICBUZZ_API_KEY;
  const apiHost = process.env.CRICBUZZ_API_HOST;
  const apiEndpoint = process.env.CRICBUZZ_API_ENDPOINT;
  console.log(apiEndpoint , apiHost , apiKey)
  // If any key is missing, stop execution and return an error UI.
  // This prevents runtime errors and makes debugging easier.
  if (!apiKey || !apiHost || !apiEndpoint) {
    console.error("CRITICAL: Missing Cricbuzz API credentials in .env.local file.");
    return (
      <div className="text-center p-4">
        <p className="text-red-500 font-semibold">Server Configuration Error</p>
        <p className="text-gray-400 text-sm">Please contact the site administrator.</p>
      </div>
    );
  }

  const options = {
    method: "GET",
    headers: {
      "x-apihub-key": apiKey,
      "x-apihub-host": apiHost,
      "x-apihub-endpoint": apiEndpoint,
    },
    // This line enables Next.js caching.
    // The data will be cached for 300 seconds (5 minutes).
    next: { revalidate: 300 },
  };

  let matchData: any[] = [];

  try {
    const response = await fetch(url, options);

    // Manually check for non-successful HTTP status codes
    if (!response.ok) {
      // Throw an error to be caught by the catch block
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Safely process and flatten the data
    const matches: any[] = [];
    data.typeMatches?.forEach((matchTypeObj: any) => {
      matchTypeObj.seriesMatches?.forEach((seriesWrapper: any) => {
        // The optional chaining operator (?.) prevents errors if a property is null or undefined
        seriesWrapper.seriesAdWrapper?.matches?.forEach((match: any) => {
          matches.push(match);
        });
      });
    });
    matchData = matches;

  } catch (error) {
    console.error("API request failed:", error);
    // If an error occurs, matchData will remain an empty array,
    // and the UI will show the "No live matches" message.
  }

  // The component returns JSX based on the fetched and processed data
  return (
    <div className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matchData.length === 0 ? (
        <p className="col-span-full text-center text-gray-400">No live matches found at the moment.</p>
      ) : (
        matchData.map((match: any) => {
          const info = match.matchInfo;
          const venue = info.venueInfo;
          const startDate = new Date(Number(info.startDate));

          // Simplified date and time formatting
          const formattedDate = startDate.toLocaleDateString("en-IN", {
            weekday: "short", month: "short", day: "numeric",
          });
          const formattedTime = startDate.toLocaleTimeString("en-IN", {
            hour: "2-digit", minute: "2-digit", hour12: true
          });

          // Scores (with safe optional chaining)
          const team1Innings = match.matchScore?.team1Score?.inngs1;
          const team2Innings = match.matchScore?.team2Score?.inngs1;

          const team1Score = team1Innings
            ? `${team1Innings.runs}/${team1Innings.wickets} (${team1Innings.overs} ov)`
            : "Yet to bat";
          const team2Score = team2Innings
            ? `${team2Innings.runs}/${team2Innings.wickets} (${team2Innings.overs} ov)`
            : "Yet to bat";

          return (
            <a key={info.matchId}
              href={`/livematches/cricket/${info.matchId}`}
              className="border border-white/10 rounded-lg shadow-lg p-4 flex flex-col gap-2 bg-gray-900 transition-transform hover:scale-105 hover:border-blue-500"
            >
              {/* Series Name */}
              <p className="text-sm text-gray-400 font-medium">{info.seriesName}</p>
              <p className="text-xs italic text-gray-500">{info.matchDesc}</p>

              {/* Teams & Scores */}
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{info.team1.teamName}</span>
                  <span className="font-bold text-lg">{team1Score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{info.team2.teamName}</span>
                  <span className="font-bold text-lg">{team2Score}</span>
                </div>
              </div>

              {/* Match Status */}
              <p className="text-xs font-semibold text-blue-400 mt-2">{info.status}</p>

              {/* Venue & Time (pushed to the bottom) */}
              <div className="mt-auto pt-3 text-sm text-gray-500 space-y-1">
                 <p>
                   📍 {venue?.ground ?? "Venue TBA"}, {venue?.city ?? ""}
                 </p>
                 <p>
                   🗓 {formattedDate} – {formattedTime} (IST)
                 </p>
              </div>
            </a>
          );
        })
      )}
    </div>
  );
}
