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


export async function NBAMatchByIdHandler({ id }: { id: string }) {
  const response = await fetch(`https://v2.nba.api-sports.io/games?id=${id}`, {
      headers: {
        "x-rapidapi-host": "v2.nba.api-sports.io",
        "x-rapidapi-key": "115c63a79ada64779433b7f133255804",
      },
      next: { revalidate: 30 },
  })
  
  const json = await response.json()
  const matchData = Array.isArray(json.response) ? json.response : []

  if (matchData.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 text-lg font-medium">Match not found</div>
        <p className="text-gray-500 text-sm mt-2">Unable to load match data</p>
      </div>
    )
  }

  const game = matchData[0]
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
    <div className="bg-[#1a1a1a] w-full border border-white/10 rounded-3xl p-8 shadow-2xl">
      {/* League Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/20 border border-blue-400/30 rounded-full">
          <span className="text-2xl">🏀</span>
          <span className="text-blue-400 font-bold text-lg">NBA</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-300 font-medium">Season {game.season}</span>
        </div>
      </div>

      {/* Teams & Main Score */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-8">
          {/* Visitors Team */}
          <div className="flex-1 text-center">
            <div className="mb-4">
              <img
                src={game.teams.visitors.logo}
                alt={game.teams.visitors.name}
                className="w-32 h-32 mx-auto object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{game.teams.visitors.nickname}</h2>
            <p className="text-sm text-gray-400 mb-2">{game.teams.visitors.name}</p>
            <div className="text-6xl font-black text-blue-400">
              {game.scores.visitors.points ?? 0}
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center">
            <div className="text-gray-500 font-bold text-2xl">VS</div>
            <div className="h-24 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent my-4"></div>
          </div>

          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="mb-4">
              <img
                src={game.teams.home.logo}
                alt={game.teams.home.name}
                className="w-32 h-32 mx-auto object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{game.teams.home.nickname}</h2>
            <p className="text-sm text-gray-400 mb-2">{game.teams.home.name}</p>
            <div className="text-6xl font-black text-blue-400">
              {game.scores.home.points ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Quarter by Quarter Scores */}
      <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4 text-center">Score Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Team</th>
                <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Q1</th>
                <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Q2</th>
                <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Q3</th>
                <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Q4</th>
                {game.scores.visitors.over_time && (
                  <th className="py-3 px-4 text-gray-400 font-semibold text-sm">OT</th>
                )}
                <th className="py-3 px-4 text-blue-400 font-bold text-sm">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Visitors Row */}
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 px-4 text-white font-semibold">{game.teams.visitors.nickname}</td>
                <td className="py-4 px-4 text-gray-300">{game.scores.visitors.linescore?.[0] ?? 0}</td>
                <td className="py-4 px-4 text-gray-300">{game.scores.visitors.linescore?.[1] ?? 0}</td>
                <td className="py-4 px-4 text-gray-300">{game.scores.visitors.linescore?.[2] ?? 0}</td>
                <td className="py-4 px-4 text-gray-300">{game.scores.visitors.linescore?.[3] ?? 0}</td>
                {game.scores.visitors.over_time && (
                  <td className="py-4 px-4 text-gray-300">{game.scores.visitors.over_time ?? 0}</td>
                )}
                <td className="py-4 px-4 text-blue-400 font-bold text-xl">{game.scores.visitors.points ?? 0}</td>
              </tr>
              {/* Home Row */}
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-4 text-white font-semibold">{game.teams.home.nickname}</td>
                <td className="py-4 px-4 text-gray-300">{game.scores.home.linescore?.[0] ?? 0}</td>
                <td className="py-4 px-4 text-gray-300">{game.scores.home.linescore?.[1] ?? 0}</td>
                <td className="py-4 px-4 text-gray-300">{game.scores.home.linescore?.[2] ?? 0}</td>
                <td className="py-4 px-4 text-gray-300">{game.scores.home.linescore?.[3] ?? 0}</td>
                {game.scores.home.over_time && (
                  <td className="py-4 px-4 text-gray-300">{game.scores.home.over_time ?? 0}</td>
                )}
                <td className="py-4 px-4 text-blue-400 font-bold text-xl">{game.scores.home.points ?? 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Game Stats */}
      <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4 text-center">Game Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Period</div>
            <div className="text-white font-bold text-lg">{game.periods.current}/{game.periods.total}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Lead Changes</div>
            <div className="text-white font-bold text-lg">{game.leadChanges ?? 0}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Times Tied</div>
            <div className="text-white font-bold text-lg">{game.timesTied ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Game Status */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center px-6 py-3 rounded-full text-base font-bold bg-blue-900/30 text-blue-400 border-2 border-blue-400/30">
          {game.status.long === "Finished" ? "🏁 Final" : game.status.long}
        </span>
      </div>

      {/* Match Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Arena */}
        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏟️</span>
            <div>
              <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Arena</div>
              <div className="text-white font-medium">{game.arena.name}</div>
              <div className="text-gray-400 text-sm">{game.arena.city}, {game.arena.state}</div>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Date & Time</div>
              <div className="text-white font-medium">{formattedDate}</div>
              <div className="text-gray-400 text-sm">{formattedTime} (UTC)</div>
            </div>
          </div>
        </div>
      </div>
  </div>
  )
}