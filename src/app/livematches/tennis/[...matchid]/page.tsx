"use client"
import { useEffect, useState } from "react"

export default function TennisMatchbyId({ params }: any) {
  const [matchdata, setmatchdata] = useState<any>(null)

  useEffect(() => {
    async function getmatchdata() {
      const matchid = await params.matchid
      // Uncomment when ready:
      // const response = await TennisMatchInfoHandler(matchid)
      // setmatchdata(response)
      
      // Mock data for preview
      setmatchdata(response)
    }
    getmatchdata()
  }, [params])

  if (!matchdata) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading match data...</p>
        </div>
      </div>
    )
  }

  const isHomeWinner = matchdata.winner === "home"
  const isAwayWinner = matchdata.winner === "away"

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                {matchdata.tournament?.name}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="font-medium">{matchdata.season?.name}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                <span className="font-medium">{matchdata.roundInfo?.name}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                matchdata.status?.description === "Ended" 
                  ? "bg-gray-100 text-gray-700" 
                  : "bg-green-100 text-green-700"
              }`}>
                {matchdata.status?.description}
              </span>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{matchdata.venue?.name}, {matchdata.venue?.city?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Set Headers */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-3">
            <div className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-4 text-white font-semibold text-sm">
              <div>Player</div>
              <div className="text-center">Set 1</div>
              <div className="text-center">Set 2</div>
              <div className="text-center">Set 3</div>
              <div className="text-center">Sets Won</div>
            </div>
          </div>

          {/* Home Player */}
          <div className={`px-6 py-5 border-b-2 transition-all ${
            isHomeWinner ? "bg-green-50 border-green-300" : "bg-white border-gray-200"
          }`}>
            <div className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  {matchdata.homeTeam?.shortName?.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">
                    {matchdata.homeTeam?.name}
                  </div>
                  {isHomeWinner && (
                    <span className="text-xs text-green-600 font-semibold">Winner</span>
                  )}
                </div>
              </div>
              <div className={`text-center text-2xl font-bold ${
                matchdata.homeScore?.period1 > matchdata.awayScore?.period1 
                  ? "text-green-600" 
                  : "text-gray-600"
              }`}>
                {matchdata.homeScore?.period1}
              </div>
              <div className={`text-center text-2xl font-bold ${
                matchdata.homeScore?.period2 > matchdata.awayScore?.period2 
                  ? "text-green-600" 
                  : "text-gray-600"
              }`}>
                {matchdata.homeScore?.period2}
              </div>
              <div className={`text-center text-2xl font-bold ${
                matchdata.homeScore?.period3 > matchdata.awayScore?.period3 
                  ? "text-green-600" 
                  : "text-gray-600"
              }`}>
                {matchdata.homeScore?.period3 || "-"}
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 text-white text-3xl font-bold shadow-lg">
                  {matchdata.homeScore?.current}
                </div>
              </div>
            </div>
          </div>

          {/* Away Player */}
          <div className={`px-6 py-5 transition-all ${
            isAwayWinner ? "bg-green-50" : "bg-white"
          }`}>
            <div className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {matchdata.awayTeam?.shortName?.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">
                    {matchdata.awayTeam?.name}
                  </div>
                  {isAwayWinner && (
                    <span className="text-xs text-green-600 font-semibold">Winner</span>
                  )}
                </div>
              </div>
              <div className={`text-center text-2xl font-bold ${
                matchdata.awayScore?.period1 > matchdata.homeScore?.period1 
                  ? "text-green-600" 
                  : "text-gray-600"
              }`}>
                {matchdata.awayScore?.period1}
              </div>
              <div className={`text-center text-2xl font-bold ${
                matchdata.awayScore?.period2 > matchdata.homeScore?.period2 
                  ? "text-green-600" 
                  : "text-gray-600"
              }`}>
                {matchdata.awayScore?.period2}
              </div>
              <div className={`text-center text-2xl font-bold ${
                matchdata.awayScore?.period3 > matchdata.homeScore?.period3 
                  ? "text-green-600" 
                  : "text-gray-600"
              }`}>
                {matchdata.awayScore?.period3 || "-"}
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white text-3xl font-bold shadow-lg">
                  {matchdata.awayScore?.current}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Match Summary */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Match Summary</h3>
          <p className="text-gray-700 text-lg">
            <span className={`font-bold ${isHomeWinner ? "text-green-600" : ""}`}>
              {matchdata.homeTeam?.name}
            </span>
            {" defeats "}
            <span className={`font-bold ${isAwayWinner ? "text-green-600" : ""}`}>
              {matchdata.awayTeam?.name}
            </span>
            {" "}
            <span className="font-bold text-gray-800">
              {matchdata.homeScore?.current} - {matchdata.awayScore?.current}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}