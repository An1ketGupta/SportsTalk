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
  const isGameLive = game.status?.long !== "Finished" && game.status?.short !== "NS";
  const isGameFinished = game.status?.long === "Finished";

  return (
    <div className="w-full space-y-4 p-4 md:p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏀</span>
          <div>
            <h1 className="text-white font-semibold text-lg">NBA</h1>
            <p className="text-gray-500 text-sm">Season {game.season}</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
          isGameLive 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : isGameFinished 
              ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' 
              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        }`}>
          {isGameLive && <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse" />}
          {isGameFinished ? "Final" : game.status?.long || "Scheduled"}
        </div>
      </div>

      {/* Venue */}
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <span>📍</span>
        <span>{game.arena?.name || 'Venue TBA'}{game.arena?.city ? `, ${game.arena.city}` : ''}{game.arena?.state ? `, ${game.arena.state}` : ''}</span>
        {game.date?.start && (
          <>
            <span className="text-gray-600">•</span>
            <span>{new Date(game.date.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </>
        )}
      </div>

      {/* Main Scoreboard */}
      <div className="bg-[#111] rounded-2xl p-6 md:p-8 border border-white/5">
        <div className="grid grid-cols-3 items-center">
          {/* Visitors Team */}
          <div className="text-center">
            <img 
              src={game.teams.visitors.logo} 
              alt={game.teams.visitors.name} 
              className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain mb-3" 
            />
            <h2 className="text-white font-medium text-sm md:text-base mb-2">{game.teams.visitors.nickname}</h2>
            <p className="text-5xl md:text-7xl font-bold text-white tabular-nums">
              {game.scores.visitors.points ?? 0}
            </p>
          </div>

          {/* Divider */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-12 bg-white/10" />
            <span className="text-gray-600 text-xs font-medium tracking-widest">VS</span>
            <div className="w-px h-12 bg-white/10" />
          </div>

          {/* Home Team */}
          <div className="text-center">
            <img 
              src={game.teams.home.logo} 
              alt={game.teams.home.name} 
              className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain mb-3" 
            />
            <h2 className="text-white font-medium text-sm md:text-base mb-2">{game.teams.home.nickname}</h2>
            <p className="text-5xl md:text-7xl font-bold text-white tabular-nums">
              {game.scores.home.points ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Quarter Scores */}
      <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <h3 className="text-white text-sm font-medium">Score by Quarter</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="py-3 px-4 font-medium text-left">Team</th>
                <th className="py-3 px-4 font-medium w-12">1</th>
                <th className="py-3 px-4 font-medium w-12">2</th>
                <th className="py-3 px-4 font-medium w-12">3</th>
                <th className="py-3 px-4 font-medium w-12">4</th>
                {game.scores.visitors.linescore && game.scores.visitors.linescore.length > 4 && (
                  <th className="py-3 px-4 font-medium w-12">OT</th>
                )}
                <th className="py-3 px-4 font-medium w-14 text-white">T</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-t border-white/5">
                <td className="py-3 px-4 text-left">
                  <div className="flex items-center gap-2">
                    <img src={game.teams.visitors.logo} alt="" className="w-5 h-5 object-contain" />
                    <span className="text-white text-sm">{game.teams.visitors.nickname}</span>
                  </div>
                </td>
                <td className="py-3 px-4 tabular-nums">{game.scores.visitors.linescore?.[0] ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{game.scores.visitors.linescore?.[1] ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{game.scores.visitors.linescore?.[2] ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{game.scores.visitors.linescore?.[3] ?? 0}</td>
                {game.scores.visitors.linescore && game.scores.visitors.linescore.length > 4 && (
                  <td className="py-3 px-4 tabular-nums">{game.scores.visitors.linescore[4]}</td>
                )}
                <td className="py-3 px-4 text-white font-semibold tabular-nums">{game.scores.visitors.points ?? 0}</td>
              </tr>
              <tr className="border-t border-white/5">
                <td className="py-3 px-4 text-left">
                  <div className="flex items-center gap-2">
                    <img src={game.teams.home.logo} alt="" className="w-5 h-5 object-contain" />
                    <span className="text-white text-sm">{game.teams.home.nickname}</span>
                  </div>
                </td>
                <td className="py-3 px-4 tabular-nums">{game.scores.home.linescore?.[0] ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{game.scores.home.linescore?.[1] ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{game.scores.home.linescore?.[2] ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{game.scores.home.linescore?.[3] ?? 0}</td>
                {game.scores.home.linescore && game.scores.home.linescore.length > 4 && (
                  <td className="py-3 px-4 tabular-nums">{game.scores.home.linescore[4]}</td>
                )}
                <td className="py-3 px-4 text-white font-semibold tabular-nums">{game.scores.home.points ?? 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performers */}
      {playerStats.length > 0 && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-white text-sm font-medium">Top Performers</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {/* Visitors Top Performers */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <img src={game.teams.visitors.logo} alt="" className="w-4 h-4 object-contain" />
                <span className="text-gray-500 text-xs">{game.teams.visitors.nickname}</span>
              </div>
              <div className="space-y-2">
                {playerStats
                  .filter((p: any) => p.team.id === game.teams.visitors.id)
                  .sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
                  .slice(0, 3)
                  .map((player: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-2 hover:bg-white/[0.02] transition-colors rounded px-2 -mx-2">
                      <span className="text-white text-sm">{player.player.firstname} {player.player.lastname}</span>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="text-white font-medium">{player.points || 0} pts</span>
                        <span>{player.totReb || 0} reb</span>
                        <span>{player.assists || 0} ast</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Home Top Performers */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <img src={game.teams.home.logo} alt="" className="w-4 h-4 object-contain" />
                <span className="text-gray-500 text-xs">{game.teams.home.nickname}</span>
              </div>
              <div className="space-y-2">
                {playerStats
                  .filter((p: any) => p.team.id === game.teams.home.id)
                  .sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
                  .slice(0, 3)
                  .map((player: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-2 hover:bg-white/[0.02] transition-colors rounded px-2 -mx-2">
                      <span className="text-white text-sm">{player.player.firstname} {player.player.lastname}</span>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="text-white font-medium">{player.points || 0} pts</span>
                        <span>{player.totReb || 0} reb</span>
                        <span>{player.assists || 0} ast</span>
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