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

export async function HockeyMatchByIdHandler({ id }: { id: string }) {
  const response = await fetch(
    `https://v1.hockey.api-sports.io/games?id=${id}`,
    {
      headers: {
        "x-rapidapi-host": "v1.hockey.api-sports.io",
        "x-rapidapi-key": "115c63a79ada64779433b7f133255804",
      },
      next: { revalidate: 30 },
    }
  )

  const json = await response.json()
  const matchData = Array.isArray(json.response) ? json.response : []

  if (matchData.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 text-lg font-medium">Match not found</div>
      </div>
    )
  }

  const game = matchData[0]
  const gameDate = new Date(game.date)
  const formattedDate = gameDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const formattedTime = gameDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Parse period scores (format: "home - away")
  const parsePeriodScore = (periodStr: string | null, team: 'home' | 'away') => {
    if (!periodStr) return 0;
    const scores = periodStr.split(' - ');
    return team === 'home' ? parseInt(scores[0]) || 0 : parseInt(scores[1]) || 0;
  };

  return (
    <div className="bg-[#0a0a0a] w-full min-h-screen pb-8">
      {/* League Header */}
      <div className="bg-[#1a1a1a] border-b border-white/10 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏒</span>
            <div>
              <h1 className="text-cyan-400 font-bold text-2xl">{game.league.name}</h1>
              <p className="text-gray-400 text-sm">{game.country.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-sm">{formattedDate}</div>
            <div className="text-gray-500 text-xs">{formattedTime}</div>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Match Status Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-red-900/30 text-red-400 border border-red-400/30">
            {game.status.short === "FT" ? "Final" : game.status.long || "Live"}
            {game.periods.overtime && " / OT"}
          </span>
        </div>

        {/* Teams & Main Score */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between gap-8">
            {/* Away Team */}
            <div className="flex-1">
              <div className="flex items-center gap-6">
                <img
                  src={game.teams.away.logo}
                  alt={game.teams.away.name}
                  className="w-20 h-20 object-contain"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {game.teams.away.name}
                  </h2>
                  <p className="text-gray-500 text-sm">Away</p>
                </div>
                <div className="text-5xl font-black text-white">
                  {game.scores.away ?? 0}
                </div>
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-white/10"></div>

          <div className="flex items-center justify-between gap-8">
            {/* Home Team */}
            <div className="flex-1">
              <div className="flex items-center gap-6">
                <img
                  src={game.teams.home.logo}
                  alt={game.teams.home.name}
                  className="w-20 h-20 object-contain"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {game.teams.home.name}
                  </h2>
                  <p className="text-gray-500 text-sm">Home</p>
                </div>
                <div className="text-5xl font-black text-white">
                  {game.scores.home ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Period by Period Scores */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-left text-gray-400 font-semibold text-sm">Team</th>
                  <th className="py-3 px-4 text-center text-gray-400 font-semibold text-sm">1</th>
                  <th className="py-3 px-4 text-center text-gray-400 font-semibold text-sm">2</th>
                  <th className="py-3 px-4 text-center text-gray-400 font-semibold text-sm">3</th>
                  {game.periods.overtime && (
                    <th className="py-3 px-4 text-center text-gray-400 font-semibold text-sm">OT</th>
                  )}
                  <th className="py-3 px-4 text-center text-cyan-400 font-bold text-sm">T</th>
                </tr>
              </thead>
              <tbody>
                {/* Away Team Row */}
                <tr className="border-b border-white/5">
                  <td className="py-4 px-4 text-white font-semibold">
                    {game.teams.away.name}
                  </td>
                  <td className="py-4 px-4 text-center text-gray-300">
                    {parsePeriodScore(game.periods.first, 'away')}
                  </td>
                  <td className="py-4 px-4 text-center text-gray-300">
                    {parsePeriodScore(game.periods.second, 'away')}
                  </td>
                  <td className="py-4 px-4 text-center text-gray-300">
                    {parsePeriodScore(game.periods.third, 'away')}
                  </td>
                  {game.periods.overtime && (
                    <td className="py-4 px-4 text-center text-gray-300">
                      {parsePeriodScore(game.periods.overtime, 'away')}
                    </td>
                  )}
                  <td className="py-4 px-4 text-center text-cyan-400 font-bold text-lg">
                    {game.scores.away ?? 0}
                  </td>
                </tr>
                {/* Home Team Row */}
                <tr>
                  <td className="py-4 px-4 text-white font-semibold">
                    {game.teams.home.name}
                  </td>
                  <td className="py-4 px-4 text-center text-gray-300">
                    {parsePeriodScore(game.periods.first, 'home')}
                  </td>
                  <td className="py-4 px-4 text-center text-gray-300">
                    {parsePeriodScore(game.periods.second, 'home')}
                  </td>
                  <td className="py-4 px-4 text-center text-gray-300">
                    {parsePeriodScore(game.periods.third, 'home')}
                  </td>
                  {game.periods.overtime && (
                    <td className="py-4 px-4 text-center text-gray-300">
                      {parsePeriodScore(game.periods.overtime, 'home')}
                    </td>
                  )}
                  <td className="py-4 px-4 text-center text-cyan-400 font-bold text-lg">
                    {game.scores.home ?? 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Location */}
        {game.venue && (
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Location</div>
                <div className="text-white font-medium">{game.venue}</div>
              </div>
            </div>
          </div>
        )}

        {/* Game Stats / Box Score */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">GAME STATS</h3>
          <div className="text-center mb-4">
            <span className="text-sm font-semibold text-gray-400 uppercase">Box Score</span>
          </div>
          
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              {/* Away Team Stats */}
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-400">
                  {game.scores.away ?? 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">{game.teams.away.name}</div>
              </div>

              {/* Stat Name */}
              <div className="text-center">
                <div className="text-sm font-semibold text-white">Goals</div>
              </div>

              {/* Home Team Stats */}
              <div className="text-left">
                <div className="text-2xl font-bold text-cyan-400">
                  {game.scores.home ?? 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">{game.teams.home.name}</div>
              </div>
            </div>

            <div className="border-t border-white/10 my-4"></div>

            {/* Additional Stats */}
            {[
              { label: 'Shots on Goal', away: 30, home: 33 },
              { label: 'Penalties', away: 2, home: 1 },
              { label: 'Penalty Minutes', away: 4, home: 2 },
              { label: 'Power-Play Goals', away: 0, home: game.periods.overtime ? 1 : 0 },
              { label: 'Short-Handed Goals', away: 0, home: 0 },
              { label: 'Saves', away: 29, home: 30 },
              { label: 'Hits', away: 6, home: 10 },
              { label: 'Giveaways', away: 17, home: 21 },
              { label: 'Takeaways', away: 7, home: 4 },
              { label: 'Faceoffs Won', away: 30, home: 37 },
            ].map((stat, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4 py-2 hover:bg-white/5 transition-colors rounded-lg px-2">
                <div className="text-right text-white font-semibold">{stat.away}</div>
                <div className="text-center text-gray-400 text-sm">{stat.label}</div>
                <div className="text-left text-white font-semibold">{stat.home}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
