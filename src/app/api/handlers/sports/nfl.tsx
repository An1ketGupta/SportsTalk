import MatchCard from "@/components/MatchCard";
import { sortByLiveStatus } from "@/lib/liveStatus";

export async function NFLMatchesHandler() {
  const todaydate = new Date().toISOString().split("T")[0];
  // @ts-ignore
  const url = `https://v1.american-football.api-sports.io/games?date=${todaydate}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "v1.american-football.api-sports.io",
      "x-rapidapi-key": "115c63a79ada64779433b7f133255804",
    },
    next: { revalidate: 30 },
  });

  const json = await response.json();
  const matchData = Array.isArray(json.response) ? json.response : [];
  const sortedGames = sortByLiveStatus(matchData, (item: any) => item?.game?.status);
  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {sortedGames.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-gray-400 text-lg font-medium">No live NFL games available</div>
            <p className="text-gray-500 text-sm mt-2">No live NFL games right now</p>
          </div>
        ) : (
          sortedGames.map((item: any) => {
            const { game, league, teams, scores } = item;

            return (
              <MatchCard
                key={game.id}
                matchId={game.id}
                league={{
                  name: `${league.name} - Week ${game.week}`,
                  emoji: "🏈",
                }}
                homeTeam={{
                  name: teams.home.name,
                  logo: teams.home.logo,
                  goals: scores.home.total ?? 0,
                }}
                awayTeam={{
                  name: teams.away.name,
                  logo: teams.away.logo,
                  goals: scores.away.total ?? 0,
                }}
                status={{
                  long: game.status.long || "Scheduled",
                  short: game.status.short,
                }}
                venue={`${game.venue.name}, ${game.venue.city}`}
                href={`../match/nf${game.id}`}
              />
            );
          })
        )}
      </div>
    </main>
  );
}


export async function NFLMatchByIdHAndler({
  id
}: {
  id: string
}) {
  const url = `https://v1.american-football.api-sports.io/games?id=${id}`
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "v1.american-football.api-sports.io",
      "x-rapidapi-key": "115c63a79ada64779433b7f133255804",
    },
    next: { revalidate: 30 },
  });

  // Fetch game statistics
  const statsUrl = `https://v1.american-football.api-sports.io/games/statistics?id=${id}`;
  const statsResponse = await fetch(statsUrl, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "v1.american-football.api-sports.io",
      "x-rapidapi-key": "115c63a79ada64779433b7f133255804",
    },
    next: { revalidate: 30 },
  });

  // Fetch game events (scoring plays)
  const eventsUrl = `https://v1.american-football.api-sports.io/games/events?id=${id}`;
  const eventsResponse = await fetch(eventsUrl, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "v1.american-football.api-sports.io",
      "x-rapidapi-key": "115c63a79ada64779433b7f133255804",
    },
    next: { revalidate: 30 },
  });

  const json = await response.json();
  const statsJson = await statsResponse.json();
  const eventsJson = await eventsResponse.json();

  const matchData = Array.isArray(json.response) ? json.response : [];
  const statsData = Array.isArray(statsJson.response) ? statsJson.response : [];
  const eventsData = Array.isArray(eventsJson.response) ? eventsJson.response : [];

  if (matchData.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 text-lg font-medium">
          Match not found
        </div>
        <p className="text-gray-500 text-sm mt-2">
          Unable to load match data
        </p>
      </div>
    );
  }

  const match = matchData[0];
  const { game, league, teams, scores } = match;

  // Parse team statistics
  const homeStats = statsData.find((s: any) => s.team?.id === teams.home.id)?.statistics || [];
  const awayStats = statsData.find((s: any) => s.team?.id === teams.away.id)?.statistics || [];

  // Helper to get stat value
  const getStat = (stats: any[], name: string) => {
    const stat = stats.find((s: any) => s.name === name);
    return stat?.value ?? "0";
  };

  const isGameLive = game.status.short !== "FT" && game.status.short !== "NS";
  const isGameFinished = game.status.short === "FT";

  return (
    <div className="w-full space-y-4 p-4 md:p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏈</span>
          <div>
            <h1 className="text-white font-semibold text-lg">{league.name}</h1>
            <p className="text-gray-500 text-sm">Week {game.week} • {league.season}</p>
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
          {isGameFinished ? "Final" : isGameLive ? "Live" : game.status.short || "Scheduled"}
        </div>
      </div>

      {/* Venue */}
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <span>📍</span>
        <span>{game.venue.name}, {game.venue.city}</span>
        {game.date && (
          <>
            <span className="text-gray-600">•</span>
            <span>{new Date(game.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </>
        )}
      </div>

      {/* Main Scoreboard */}
      <div className="bg-[#111] rounded-2xl p-6 md:p-8 border border-white/5">
        <div className="grid grid-cols-3 items-center">
          {/* Home Team */}
          <div className="text-center">
            <img 
              src={teams.home.logo} 
              alt={teams.home.name} 
              className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain mb-3" 
            />
            <h2 className="text-white font-medium text-sm md:text-base mb-2">{teams.home.name}</h2>
            <p className="text-5xl md:text-7xl font-bold text-white tabular-nums">
              {scores.home.total ?? 0}
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
              src={teams.away.logo} 
              alt={teams.away.name} 
              className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain mb-3" 
            />
            <h2 className="text-white font-medium text-sm md:text-base mb-2">{teams.away.name}</h2>
            <p className="text-5xl md:text-7xl font-bold text-white tabular-nums">
              {scores.away.total ?? 0}
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
                {scores.home.overtime !== null && <th className="py-3 px-4 font-medium w-12">OT</th>}
                <th className="py-3 px-4 font-medium w-14 text-white">T</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-t border-white/5">
                <td className="py-3 px-4 text-left">
                  <div className="flex items-center gap-2">
                    <img src={teams.home.logo} alt="" className="w-5 h-5 object-contain" />
                    <span className="text-white text-sm">{teams.home.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 tabular-nums">{scores.home.quarter_1 ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{scores.home.quarter_2 ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{scores.home.quarter_3 ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{scores.home.quarter_4 ?? 0}</td>
                {scores.home.overtime !== null && <td className="py-3 px-4 tabular-nums">{scores.home.overtime ?? 0}</td>}
                <td className="py-3 px-4 text-white font-semibold tabular-nums">{scores.home.total ?? 0}</td>
              </tr>
              <tr className="border-t border-white/5">
                <td className="py-3 px-4 text-left">
                  <div className="flex items-center gap-2">
                    <img src={teams.away.logo} alt="" className="w-5 h-5 object-contain" />
                    <span className="text-white text-sm">{teams.away.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 tabular-nums">{scores.away.quarter_1 ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{scores.away.quarter_2 ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{scores.away.quarter_3 ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{scores.away.quarter_4 ?? 0}</td>
                {scores.away.overtime !== null && <td className="py-3 px-4 tabular-nums">{scores.away.overtime ?? 0}</td>}
                <td className="py-3 px-4 text-white font-semibold tabular-nums">{scores.away.total ?? 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Statistics */}
      {(homeStats.length > 0 || awayStats.length > 0) && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-white text-sm font-medium">Team Stats</h3>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <img src={teams.home.logo} alt="" className="w-4 h-4 object-contain" />
                <span className="hidden sm:inline">{teams.home.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">{teams.away.name}</span>
                <img src={teams.away.logo} alt="" className="w-4 h-4 object-contain" />
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {[
              { name: "Total Yards", key: "Total Yards" },
              { name: "Passing", key: "Yards Passing" },
              { name: "Rushing", key: "Yards Rushing" },
              { name: "First Downs", key: "First Downs" },
              { name: "Turnovers", key: "Turnovers" },
              { name: "Possession", key: "Possession" },
            ].map((stat) => {
              const homeVal = getStat(homeStats, stat.key);
              const awayVal = getStat(awayStats, stat.key);
              const homeNum = parseFloat(homeVal) || 0;
              const awayNum = parseFloat(awayVal) || 0;
              const total = homeNum + awayNum || 1;
              const homePercent = (homeNum / total) * 100;

              return (
                <div key={stat.key}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className={`tabular-nums ${homeNum > awayNum ? 'text-white font-medium' : 'text-gray-400'}`}>{homeVal}</span>
                    <span className="text-gray-500 text-xs">{stat.name}</span>
                    <span className={`tabular-nums ${awayNum > homeNum ? 'text-white font-medium' : 'text-gray-400'}`}>{awayVal}</span>
                  </div>
                  <div className="flex h-1 bg-white/5 rounded-full overflow-hidden gap-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${homeNum >= awayNum ? 'bg-white' : 'bg-white/30'}`}
                      style={{ width: `${homePercent}%` }}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-500 flex-1 ${awayNum > homeNum ? 'bg-white' : 'bg-white/30'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scoring Plays */}
      {eventsData.length > 0 && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-white text-sm font-medium">Scoring Plays</h3>
            <span className="text-gray-500 text-xs">{eventsData.length} plays</span>
          </div>
          
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto scrollbar-hide">
            {eventsData.map((event: any, idx: number) => {
              const isHomeTeam = event.team?.id === teams.home.id;
              const teamLogo = isHomeTeam ? teams.home.logo : teams.away.logo;

              return (
                <div key={idx} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-3">
                    <img src={teamLogo} alt="" className="w-6 h-6 object-contain mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <span>Q{event.quarter || "?"}</span>
                        <span>•</span>
                        <span>{event.minute || "0"}:{String(event.second || "0").padStart(2, '0')}</span>
                        {event.type && (
                          <>
                            <span>•</span>
                            <span className="uppercase">{event.type}</span>
                          </>
                        )}
                      </div>
                      <p className="text-white text-sm">{event.comment || "Scoring play"}</p>
                      {event.player && (
                        <p className="text-gray-500 text-xs mt-1">{event.player.name}</p>
                      )}
                    </div>
                    <div className="text-white font-medium text-sm tabular-nums flex-shrink-0">
                      {event.score?.home ?? 0} - {event.score?.away ?? 0}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}