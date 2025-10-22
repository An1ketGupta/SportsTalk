export default async function HocketMatchesHandler() {
  const todaydate = new Date().toISOString().split("T")[0]

  const response = await fetch(
    `https://v1.hockey.api-sports.io/games?date=${todaydate}`,
    {
      headers: {
        "x-rapidapi-host": "v1.hockey.api-sports.io",
        "x-rapidapi-key": "115c63a79ada64779433b7f133255804",
      },
      next: { revalidate: 30 },
    }
  )

  const json = await response.json()
  const data = json.response
  const matchData = Array.isArray(data) ? data : []

  return (
    <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {matchData.length === 0 ? (
        <div className="col-span-full text-center py-20">
          <div className="text-gray-400 text-lg font-medium">
            Loading Hockey games...
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Fetching live hockey scores and match data
          </p>
        </div>
      ) : (
        matchData.map((game: any) => {
          const gameDate = new Date(game.date)
          const formattedDate = gameDate.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          const formattedTime = gameDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })

          return (
            <a
              href={`../match/ho${game.id}`}
              key={game.id}
              className="group bg-[#181818] hover:bg-[#1f1f1f] border border-white/5 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col"
            >
              {/* League Info */}
              <div className="text-center mb-4">
                <div className="text-sm font-medium text-cyan-400 mb-1">
                  🏒 {game.league.name}
                </div>
                <p className="text-xs text-gray-500">({game.country.name})</p>
              </div>

              {/* Teams & Scores */}
              <div className="flex justify-between items-center mb-4">
                {/* Home Team */}
                <div className="flex flex-col items-center flex-1">
                  <img
                    src={game.teams.home.logo}
                    alt={game.teams.home.name}
                    className="w-14 h-14 object-contain mb-2"
                  />
                  <span className="text-sm font-semibold text-center text-white mb-1">
                    {game.teams.home.name}
                  </span>
                  <span className="text-2xl font-bold text-cyan-400">
                    {game.scores.home}
                  </span>
                </div>

                <span className="text-gray-400 font-bold text-lg px-3">VS</span>

                {/* Away Team */}
                <div className="flex flex-col items-center flex-1">
                  <img
                    src={game.teams.away.logo}
                    alt={game.teams.away.name}
                    className="w-14 h-14 object-contain mb-2"
                  />
                  <span className="text-sm font-semibold text-center text-white mb-1">
                    {game.teams.away.name}
                  </span>
                  <span className="text-2xl font-bold text-cyan-400">
                    {game.scores.away}
                  </span>
                </div>
              </div>

              {/* Period Scores */}
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">1st:</span>
                    <span className="text-white font-medium">
                      {game.periods.first}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">2nd:</span>
                    <span className="text-white font-medium">
                      {game.periods.second}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">3rd:</span>
                    <span className="text-white font-medium">
                      {game.periods.third}
                    </span>
                  </div>
                  {game.periods.overtime && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">OT:</span>
                      <span className="text-white font-medium">
                        {game.periods.overtime}
                      </span>
                    </div>
                  )}
                </div>
                {game.periods.penalties && (
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-700">
                    <span className="text-gray-400 text-xs">Penalties:</span>
                    <span className="text-white font-medium text-xs">
                      {game.periods.penalties}
                    </span>
                  </div>
                )}
              </div>

              {/* Match Details */}
              <div className="space-y-2 text-xs text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <span>🗓</span>
                  <span>
                    {formattedDate} – {formattedTime} ({game.timezone})
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="text-center mt-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-900/30 text-cyan-400 border border-cyan-400/20">
                  {game.status.long || "Live"}
                </span>
              </div>
            </a>
          )
        })
      )}
    </main>
  )
}
