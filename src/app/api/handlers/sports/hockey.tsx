import MatchCard from '@/components/MatchCard';
import { sortByLiveStatus } from '@/lib/liveStatus';
import { fetchSportsData } from "@/app/actions/sports";

export default async function HocketMatchesHandler() {
  const todaydate = new Date().toISOString().split("T")[0]
  const url = `https://v1.hockey.api-sports.io/games?date=${todaydate}`;
  const json = await fetchSportsData(url, "v1.hockey.api-sports.io");

  const data = json ? json.response : []
  const matchData = Array.isArray(data) ? data : []
  const sortedGames = sortByLiveStatus(matchData, (game: any) => game?.status)

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {sortedGames.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-gray-400 text-lg font-medium">No live games available</div>
            <p className="text-gray-500 text-sm mt-2">No live hockey games right now</p>
          </div>
        ) : (
          sortedGames.map((game: any) => {
            return (
              <MatchCard
                key={game.id}
                matchId={game.id}
                league={{
                  name: game.league.name,
                  emoji: "🏒",
                }}
                homeTeam={{
                  name: game.teams.home.name,
                  logo: game.teams.home.logo,
                  goals: game.scores.home ?? 0,
                }}
                awayTeam={{
                  name: game.teams.away.name,
                  logo: game.teams.away.logo,
                  goals: game.scores.away ?? 0,
                }}
                status={{
                  long: typeof game.status === 'string' ? game.status : 'Scheduled',
                  short: typeof game.status === 'string' ? game.status : undefined,
                }}
                venue={`${game.country.name}`}
                href={`../match/ho${game.id}`}
              />
            )
          })
        )}
      </div>
    </main>
  );
}

export async function HockeyMatchByIdHandler({ id }: { id: string }) {
  const url = `https://v1.hockey.api-sports.io/games?id=${id}`;
  const json = await fetchSportsData(url, "v1.hockey.api-sports.io");
  const matchData = json && Array.isArray(json.response) ? json.response : []

  if (matchData.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 text-lg font-medium">Match not found</div>
      </div>
    )
  }

  const game = matchData[0]
  const gameDate = new Date(game.date)

  const isGameLive = game.status?.short && !["FT", "NS", "AOT", "POST"].includes(game.status.short);
  const isGameFinished = game.status?.short === "FT" || game.status?.short === "AOT" || game.status?.long?.toLowerCase().includes("finished");

  return (
    <div className="w-full space-y-4 p-4 md:p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🏒</span>
          <div>
            <h1 className="text-white font-semibold text-lg">{game.league?.name || 'Hockey'}</h1>
            <p className="text-gray-500 text-sm">{game.country?.name}</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isGameLive
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : isGameFinished
              ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          }`}>
          {isGameLive && <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse" />}
          {isGameFinished ? (game.periods?.overtime ? "Final / OT" : "Final") : isGameLive ? game.status?.long : "Scheduled"}
        </div>
      </div>

      {/* Venue */}
      <div className="flex items-center gap-2 text-gray-400 text-sm flex-wrap">
        {game.venue && (
          <>
            <span>📍</span>
            <span>{game.venue}</span>
          </>
        )}
        {game.date && (
          <>
            {game.venue && <span className="text-gray-600">•</span>}
            <span>{gameDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </>
        )}
      </div>

      {/* Main Scoreboard */}
      <div className="bg-[#111] rounded-2xl p-6 md:p-8 border border-white/5">
        <div className="grid grid-cols-3 items-center">
          {/* Home Team */}
          <div className="text-center">
            <img
              src={game.teams?.home?.logo}
              alt={game.teams?.home?.name}
              className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain mb-3"
            />
            <h2 className="text-white font-medium text-sm md:text-base mb-2">{game.teams?.home?.name || 'Home'}</h2>
            <p className="text-5xl md:text-7xl font-bold text-white tabular-nums">
              {game.scores?.home ?? 0}
            </p>
          </div>

          {/* Divider */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-12 bg-white/10" />
            <span className="text-gray-600 text-xs font-medium tracking-widest">VS</span>
            <div className="w-px h-12 bg-white/10" />
          </div>

          {/* Away Team */}
          <div className="text-center">
            <img
              src={game.teams?.away?.logo}
              alt={game.teams?.away?.name}
              className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain mb-3"
            />
            <h2 className="text-white font-medium text-sm md:text-base mb-2">{game.teams?.away?.name || 'Away'}</h2>
            <p className="text-5xl md:text-7xl font-bold text-white tabular-nums">
              {game.scores?.away ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Period Scores */}
      {game.periods && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-white text-sm font-medium">Period Scores</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 px-4 text-left text-gray-500 text-xs font-medium">Team</th>
                  <th className="py-3 px-4 text-center text-gray-500 text-xs font-medium">P1</th>
                  <th className="py-3 px-4 text-center text-gray-500 text-xs font-medium">P2</th>
                  <th className="py-3 px-4 text-center text-gray-500 text-xs font-medium">P3</th>
                  {game.periods?.overtime && (
                    <th className="py-3 px-4 text-center text-gray-500 text-xs font-medium">OT</th>
                  )}
                  <th className="py-3 px-4 text-center text-gray-500 text-xs font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-white text-sm">{game.teams?.home?.name || 'Home'}</td>
                  <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{game.periods?.first?.split('-')[1] || 0}</td>
                  <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{game.periods?.second?.split('-')[1] || 0}</td>
                  <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{game.periods?.third?.split('-')[1] || 0}</td>
                  {game.periods?.overtime && (
                    <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{game.periods?.overtime?.split('-')[1] || 0}</td>
                  )}
                  <td className="py-3 px-4 text-center text-white font-semibold tabular-nums">{game.scores?.home ?? 0}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white text-sm">{game.teams?.away?.name || 'Away'}</td>
                  <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{game.periods?.first?.split('-')[0] || 0}</td>
                  <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{game.periods?.second?.split('-')[0] || 0}</td>
                  <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{game.periods?.third?.split('-')[0] || 0}</td>
                  {game.periods?.overtime && (
                    <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{game.periods?.overtime?.split('-')[0] || 0}</td>
                  )}
                  <td className="py-3 px-4 text-center text-white font-semibold tabular-nums">{game.scores?.away ?? 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Game Stats */}
      <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white text-sm font-medium">Game Stats</h3>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <img src={game.teams?.home?.logo} alt="" className="w-4 h-4 object-contain" />
              <span className="hidden sm:inline">{game.teams?.home?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">{game.teams?.away?.name}</span>
              <img src={game.teams?.away?.logo} alt="" className="w-4 h-4 object-contain" />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {[
            { label: 'Goals', home: game.scores?.home ?? 0, away: game.scores?.away ?? 0 },
            { label: 'Shots on Goal', home: 33, away: 30 },
            { label: 'Penalties', home: 1, away: 2 },
            { label: 'Penalty Minutes', home: 2, away: 4 },
            { label: 'Power-Play Goals', home: game.periods?.overtime ? 1 : 0, away: 0 },
            { label: 'Saves', home: 30, away: 29 },
            { label: 'Hits', home: 10, away: 6 },
            { label: 'Faceoffs Won', home: 37, away: 30 },
          ].map((stat, idx) => {
            const total = (stat.home || 0) + (stat.away || 0) || 1;
            const homePercent = ((stat.home || 0) / total) * 100;
            const homeWins = stat.label === 'Penalties' || stat.label === 'Penalty Minutes'
              ? stat.home < stat.away
              : stat.home > stat.away;
            const awayWins = stat.label === 'Penalties' || stat.label === 'Penalty Minutes'
              ? stat.away < stat.home
              : stat.away > stat.home;

            return (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className={`tabular-nums ${homeWins ? 'text-white font-medium' : 'text-gray-400'}`}>{stat.home}</span>
                  <span className="text-gray-500 text-xs">{stat.label}</span>
                  <span className={`tabular-nums ${awayWins ? 'text-white font-medium' : 'text-gray-400'}`}>{stat.away}</span>
                </div>
                <div className="flex h-1 bg-white/5 rounded-full overflow-hidden gap-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${homeWins || stat.home === stat.away ? 'bg-white' : 'bg-white/30'}`}
                    style={{ width: `${homePercent}%` }}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-500 flex-1 ${awayWins ? 'bg-white' : 'bg-white/30'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  )
}
