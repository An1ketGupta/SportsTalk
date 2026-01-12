import MatchCard from '@/components/MatchCard';
import { sortByLiveStatus } from '@/lib/liveStatus';

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
  const sortedGames = sortByLiveStatus(matchData, (game: any) => game?.status)

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {sortedGames.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-gray-400 text-lg font-medium">No live games available</div>
            <p className="text-gray-500 text-sm mt-2">No live NBA games right now</p>
          </div>
        ) : (
          sortedGames.map((game: any) => {
            return (
              <MatchCard
                key={game.id}
                matchId={game.id}
                league={{
                  name: 'NBA',
                  emoji: "🏀",
                }}
                homeTeam={{
                  name: game.teams.home.name,
                  logo: game.teams.home.logo,
                  goals: game.scores.home.points ?? 0,
                }}
                awayTeam={{
                  name: game.teams.visitors.name,
                  logo: game.teams.visitors.logo,
                  goals: game.scores.visitors.points ?? 0,
                }}
                status={{
                  long: typeof game.status === 'string' ? game.status : 'Scheduled',
                  short: typeof game.status === 'string' ? game.status : undefined,
                }}
                venue={`${game.arena.name}, ${game.arena.city}, ${game.arena.state}`}
                href={`../match/nb${game.id}`}
              />
            )
          })
        )}
      </div>
    </main>
  );
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
  console.log(json)
  const matchData = Array.isArray(json.response) ? json.response : []

  // Fetch player statistics for this game
  const playersRes = await fetch(`https://v2.nba.api-sports.io/players/statistics?game=${id}` , {
    headers: {
      "x-rapidapi-host": "v2.nba.api-sports.io",
      "x-rapidapi-key": "115c63a79ada64779433b7f133255804",
    },
    next: { revalidate: 30 },
  })
  const playersJson = await playersRes.json()
  const playerStats = Array.isArray(playersJson.response) ? playersJson.response : []

  if (matchData.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 text-lg font-medium">Match not found</div>
        <p className="text-gray-500 text-sm mt-2">Unable to load match data</p>
      </div>
    )
  }

  const game = matchData[0]
  return (
    <div className="bg-[#1a1a1a] w-full border border-white/10 rounded-3xl p-8 shadow-2xl">
      {/* Header with League and Status */}
      <div className="flex items-center justify-between mb-8">
        {/* League Info */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/20 border border-blue-400/30 rounded-full">
          <span className="text-2xl">🏀</span>
          <span className="text-blue-400 font-bold text-lg">NBA</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-300 font-medium">Season {game.season}</span>
        </div>

        {/* Status and Time */}
        <div className="flex items-center gap-4">
          {game.date?.start && (
            <div className="text-right">
              <div className="text-gray-400 text-xs">
                {new Date(game.date.start).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-white font-semibold text-sm">
                {new Date(game.date.start).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
          
          <div className="bg-black/30 rounded-xl px-4 py-2 border border-white/5">
            <div className="text-white font-bold text-sm">{game.status?.long || 'N/A'}</div>
            {game.status?.clock && (
              <div className="text-gray-400 text-xs text-center">{game.status.clock}</div>
            )}
          </div>
        </div>
      </div>

      {/* Venue Information */}
      <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/5 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">🏟️</span>
          <span className="text-white font-semibold">{game.arena?.name || 'Venue TBA'}</span>
          {game.arena?.city && game.arena?.state && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{game.arena.city}, {game.arena.state}</span>
            </>
          )}
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
                <th className="py-3 px-4 text-left text-gray-400 font-semibold text-sm">Team</th>
                <th className="py-3 px-4 text-center text-gray-400 font-semibold text-sm">Q1</th>
                <th className="py-3 px-4 text-center text-gray-400 font-semibold text-sm">Q2</th>
                <th className="py-3 px-4 text-center text-gray-400 font-semibold text-sm">Q3</th>
                <th className="py-3 px-4 text-center text-gray-400 font-semibold text-sm">Q4</th>
                {game.scores.visitors.linescore && game.scores.visitors.linescore.length > 4 && (
                  <th className="py-3 px-4 text-center text-gray-400 font-semibold text-sm">OT</th>
                )}
                <th className="py-3 px-4 text-center text-blue-400 font-bold text-sm">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-4 px-4 text-white font-semibold text-left">
                  {game.teams.visitors.nickname}
                </td>
                <td className="py-4 px-4 text-center text-gray-300">
                  {game.scores.visitors.linescore?.[0] ?? 0}
                </td>
                <td className="py-4 px-4 text-center text-gray-300">
                  {game.scores.visitors.linescore?.[1] ?? 0}
                </td>
                <td className="py-4 px-4 text-center text-gray-300">
                  {game.scores.visitors.linescore?.[2] ?? 0}
                </td>
                <td className="py-4 px-4 text-center text-gray-300">
                  {game.scores.visitors.linescore?.[3] ?? 0}
                </td>
                {game.scores.visitors.linescore && game.scores.visitors.linescore.length > 4 && (
                  <td className="py-4 px-4 text-center text-gray-300">
                    {game.scores.visitors.linescore[4]}
                  </td>
                )}
                <td className="py-4 px-4 text-center text-blue-400 font-bold text-lg">
                  {game.scores.visitors.points ?? 0}
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 text-white font-semibold text-left">
                  {game.teams.home.nickname}
                </td>
                <td className="py-4 px-4 text-center text-gray-300">
                  {game.scores.home.linescore?.[0] ?? 0}
                </td>
                <td className="py-4 px-4 text-center text-gray-300">
                  {game.scores.home.linescore?.[1] ?? 0}
                </td>
                <td className="py-4 px-4 text-center text-gray-300">
                  {game.scores.home.linescore?.[2] ?? 0}
                </td>
                <td className="py-4 px-4 text-center text-gray-300">
                  {game.scores.home.linescore?.[3] ?? 0}
                </td>
                {game.scores.home.linescore && game.scores.home.linescore.length > 4 && (
                  <td className="py-4 px-4 text-center text-gray-300">
                    {game.scores.home.linescore[4]}
                  </td>
                )}
                <td className="py-4 px-4 text-center text-blue-400 font-bold text-lg">
                  {game.scores.home.points ?? 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Officials Section */}
      {game.officials && game.officials.length > 0 && (
        <div className="bg-black/30 rounded-xl p-5 mb-6 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">👨‍⚖️</span>
            <h4 className="text-white font-bold">Officials</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {game.officials.map((official: string, idx: number) => (
              <span key={idx} className="bg-white/5 text-gray-300 text-sm px-3 py-1 rounded-full">
                {official}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Performers Section */}
      {playerStats.length > 0 && (
        <div className="bg-black/30 rounded-xl p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 text-center">Top Performers</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visitors Top Performers */}
            <div>
              <h4 className="text-blue-400 font-bold mb-4 text-center">{game.teams.visitors.nickname}</h4>
              <div className="space-y-3">
                {playerStats
                  .filter((p: any) => p.team.id === game.teams.visitors.id)
                  .sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
                  .slice(0, 5)
                  .map((player: any, idx: number) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-400 font-bold text-sm">{idx + 1}</span>
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">
                              {player.player.firstname} {player.player.lastname}
                            </div>
                            <div className="text-gray-400 text-xs">{player.pos || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{player.points || 0} pts</div>
                          <div className="text-gray-400 text-xs">
                            {player.totReb || 0}R • {player.assists || 0}A
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Home Top Performers */}
            <div>
              <h4 className="text-blue-400 font-bold mb-4 text-center">{game.teams.home.nickname}</h4>
              <div className="space-y-3">
                {playerStats
                  .filter((p: any) => p.team.id === game.teams.home.id)
                  .sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
                  .slice(0, 5)
                  .map((player: any, idx: number) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-400 font-bold text-sm">{idx + 1}</span>
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">
                              {player.player.firstname} {player.player.lastname}
                            </div>
                            <div className="text-gray-400 text-xs">{player.pos || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{player.points || 0} pts</div>
                          <div className="text-gray-400 text-xs">
                            {player.totReb || 0}R • {player.assists || 0}A
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}