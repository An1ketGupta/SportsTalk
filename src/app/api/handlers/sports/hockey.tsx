import MatchCard from '@/components/MatchCard';
import { sortByLiveStatus } from '@/lib/liveStatus';

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

  // Parse period scores (format: "away-home")
  const parsePeriodScore = (periodStr: string | null, team: 'home' | 'away') => {
    if (!periodStr) return 0;
    const scores = periodStr.split('-');
    return team === 'away' ? parseInt(scores[0]) || 0 : parseInt(scores[1]) || 0;
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
            <div className="flex-1 text-center">
              <img
                src={game.teams.away.logo}
                alt={game.teams.away.name}
                className="w-24 h-24 mx-auto object-contain mb-4"
              />
              <h2 className="text-2xl font-bold text-white mb-2">
                {game.teams.away.name}
              </h2>
              <p className="text-gray-500 text-sm mb-3">Away</p>
              <div className="text-6xl font-black text-cyan-400">
                {game.scores.away ?? 0}
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex flex-col items-center px-4">
              <div className="text-gray-500 font-bold text-2xl">VS</div>
              <div className="h-32 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent my-4"></div>
            </div>

            {/* Home Team */}
            <div className="flex-1 text-center">
              <img
                src={game.teams.home.logo}
                alt={game.teams.home.name}
                className="w-24 h-24 mx-auto object-contain mb-4"
              />
              <h2 className="text-2xl font-bold text-white mb-2">
                {game.teams.home.name}
              </h2>
              <p className="text-gray-500 text-sm mb-3">Home</p>
              <div className="text-6xl font-black text-cyan-400">
                {game.scores.home ?? 0}
              </div>
            </div>
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
