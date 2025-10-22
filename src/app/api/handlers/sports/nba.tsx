export default async function NBAMatchesHandler() {
  const todaydate = new Date().toISOString().split("T")[0]

  const response = await fetch(
    `https://v2.nba.api-sports.io/games?date=${todaydate}`,
    {
      headers: {
        "x-rapidapi-host": "v2.nba.api-sports.io",
        "x-rapidapi-key": "115c63a79ada64779433b7f133255804",
      },
      next: { revalidate: 30 },
    }
  )

  const json = await response.json()
  const data = json.response
  const matchData = Array.isArray(data) ? data : []

  return (
    <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matchData.length === 0 ? (
        <p>Loading NBA games...</p>
      ) : (
        matchData.map((game: any) => {
          const startDate = new Date(game.date.start)
          const formattedDate = startDate.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          const formattedTime = startDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })

          return (
            <a
              href={`../match/nb${game.id}`}
              key={game.id}
              className="border rounded-lg shadow p-4 flex flex-col gap-2 bg-gray-900"
            >
              {/* Arena */}
              <p className="text-sm text-gray-400 font-medium">
                🏟 {game.arena.name}, {game.arena.city}, {game.arena.state}
              </p>

              {/* Date & Time */}
              <p className="text-sm text-gray-500">
                🗓 {formattedDate} – {formattedTime} (UTC)
              </p>

              {/* Teams */}
              <div className="flex items-center justify-between mt-2">
                {/* Visitor */}
                <div className="flex flex-col items-center">
                  <img
                    src={game.teams.visitors.logo}
                    alt={game.teams.visitors.name}
                    className="w-12 h-12 object-contain mb-1"
                  />
                  <span className="text-sm font-semibold">
                    {game.teams.visitors.nickname}
                  </span>
                  <span className="text-xs text-gray-400">
                    {game.teams.visitors.name}
                  </span>
                  <span className="text-lg font-bold mt-1">
                    {game.scores.visitors.points}
                  </span>
                </div>

                <span className="text-xl font-bold">VS</span>

                {/* Home */}
                <div className="flex flex-col items-center">
                  <img
                    src={game.teams.home.logo}
                    alt={game.teams.home.name}
                    className="w-12 h-12 object-contain mb-1"
                  />
                  <span className="text-sm font-semibold">
                    {game.teams.home.nickname}
                  </span>
                  <span className="text-xs text-gray-400">
                    {game.teams.home.name}
                  </span>
                  <span className="text-lg font-bold mt-1">
                    {game.scores.home.points}
                  </span>
                </div>
              </div>

              {/* Status */}
              <p className="text-xs text-blue-400 mt-2">
                Status: {game.status.long}
              </p>

              {/* Optional: Periods and lead changes */}
              <p className="text-xs text-gray-500">
                Period: {game.periods.current}/{game.periods.total} | Lead
                Changes: {game.leadChanges} | Times Tied: {game.timesTied}
              </p>
            </a>
          )
        })
      )}
    </main>
  )
}
