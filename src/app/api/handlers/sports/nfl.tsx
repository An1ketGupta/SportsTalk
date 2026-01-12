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

  return (
    <div className="bg-[#1a1a1a] w-full border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
      {/* League & Week Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900/20 border border-amber-400/30 rounded-full">
          <span className="text-2xl">🏈</span>
          <span className="text-amber-400 font-bold text-lg">{league.name}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-300 font-medium">Week {game.week}</span>
        </div>
      </div>

      {/* Venue */}
      <div className="bg-black/20 rounded-xl p-4 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <span className="text-xl">🏟️</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="text-white font-medium text-lg">{game.venue.name}</div>
            <div className="text-gray-400 text-md">{game.venue.city}</div>
          </div>
        </div>
      </div>

      {/* Teams & Main Score */}
      <div className="bg-gradient-to-br from-amber-900/10 to-transparent rounded-2xl p-6 border border-amber-500/10">
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <img src={teams.home.logo} alt={teams.home.name} className="w-24 h-24 md:w-32 md:h-32 mx-auto object-contain mb-3" />
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{teams.home.name}</h2>
            <div className="text-5xl md:text-6xl font-black text-amber-400">{scores.home.total ?? 0}</div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center px-4">
            <div className="text-gray-600 font-bold text-xl">VS</div>
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-amber-500/30 to-transparent my-2"></div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${game.status.short === "FT"
                ? "bg-gray-700 text-gray-300"
                : "bg-green-500/20 text-green-400 animate-pulse"
              }`}>
              {game.status.short === "FT" ? "FINAL" : game.status.short || "LIVE"}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <img src={teams.away.logo} alt={teams.away.name} className="w-24 h-24 md:w-32 md:h-32 mx-auto object-contain mb-3" />
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{teams.away.name}</h2>
            <div className="text-5xl md:text-6xl font-black text-amber-400">{scores.away.total ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Quarter by Quarter Scores */}
      <div className="bg-black/30 rounded-xl p-5 border border-white/5">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <span>📊</span> Score by Quarter
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 px-3 text-gray-400 font-semibold text-left">Team</th>
                <th className="py-2 px-3 text-gray-400 font-semibold">Q1</th>
                <th className="py-2 px-3 text-gray-400 font-semibold">Q2</th>
                <th className="py-2 px-3 text-gray-400 font-semibold">Q3</th>
                <th className="py-2 px-3 text-gray-400 font-semibold">Q4</th>
                {scores.home.overtime !== null && (
                  <th className="py-2 px-3 text-gray-400 font-semibold">OT</th>
                )}
                <th className="py-2 px-3 text-amber-400 font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-3 px-3 text-white font-medium text-left flex items-center gap-2">
                  <img src={teams.home.logo} alt="" className="w-5 h-5 object-contain" />
                  {teams.home.name}
                </td>
                <td className="py-3 px-3 text-gray-300">{scores.home.quarter_1 ?? 0}</td>
                <td className="py-3 px-3 text-gray-300">{scores.home.quarter_2 ?? 0}</td>
                <td className="py-3 px-3 text-gray-300">{scores.home.quarter_3 ?? 0}</td>
                <td className="py-3 px-3 text-gray-300">{scores.home.quarter_4 ?? 0}</td>
                {scores.home.overtime !== null && (
                  <td className="py-3 px-3 text-gray-300">{scores.home.overtime ?? 0}</td>
                )}
                <td className="py-3 px-3 text-amber-400 font-bold text-lg">{scores.home.total ?? 0}</td>
              </tr>
              <tr>
                <td className="py-3 px-3 text-white font-medium text-left flex items-center gap-2">
                  <img src={teams.away.logo} alt="" className="w-5 h-5 object-contain" />
                  {teams.away.name}
                </td>
                <td className="py-3 px-3 text-gray-300">{scores.away.quarter_1 ?? 0}</td>
                <td className="py-3 px-3 text-gray-300">{scores.away.quarter_2 ?? 0}</td>
                <td className="py-3 px-3 text-gray-300">{scores.away.quarter_3 ?? 0}</td>
                <td className="py-3 px-3 text-gray-300">{scores.away.quarter_4 ?? 0}</td>
                {scores.away.overtime !== null && (
                  <td className="py-3 px-3 text-gray-300">{scores.away.overtime ?? 0}</td>
                )}
                <td className="py-3 px-3 text-amber-400 font-bold text-lg">{scores.away.total ?? 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring Plays */}
      {eventsData.length > 0 && (
        <div className="bg-black/30 rounded-xl p-5 border border-white/5">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span>🎯</span> Scoring Plays
            <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
              {eventsData.length} plays
            </span>
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide pr-2">
            {eventsData.map((event: any, idx: number) => {
              const isHomeTeam = event.team?.id === teams.home.id;
              const teamLogo = isHomeTeam ? teams.home.logo : teams.away.logo;
              const teamName = isHomeTeam ? teams.home.name : teams.away.name;

              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                  <img src={teamLogo} alt={teamName} className="w-8 h-8 object-contain flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                        Q{event.quarter || "?"} • {event.minute || "0"}:{event.second || "00"}
                      </span>
                      <span className="text-xs text-gray-500">{event.type || "Score"}</span>
                    </div>
                    <p className="text-sm text-white font-medium">{event.comment || "Scoring play"}</p>
                    {event.player && (
                      <p className="text-xs text-gray-400 mt-1">
                        👤 {event.player.name}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="text-gray-500">Score:</span>
                      <span className="text-white font-semibold">
                        {teams.home.name} {event.score?.home ?? 0} - {event.score?.away ?? 0} {teams.away.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Statistics */}
      {(homeStats.length > 0 || awayStats.length > 0) && (
        <div className="bg-black/30 rounded-xl p-5 border border-white/5">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span>📈</span> Team Statistics
          </h3>
          <div className="space-y-4">
            {/* Key Stats */}
            {[
              { name: "Total Yards", key: "Total Yards" },
              { name: "Passing Yards", key: "Yards Passing" },
              { name: "Rushing Yards", key: "Yards Rushing" },
              { name: "First Downs", key: "First Downs" },
              { name: "Turnovers", key: "Turnovers" },
              { name: "Penalties", key: "Penalties" },
              { name: "Time of Possession", key: "Possession" },
            ].map((stat) => {
              const homeVal = getStat(homeStats, stat.key);
              const awayVal = getStat(awayStats, stat.key);
              const homeNum = parseFloat(homeVal) || 0;
              const awayNum = parseFloat(awayVal) || 0;
              const total = homeNum + awayNum || 1;
              const homePercent = (homeNum / total) * 100;

              return (
                <div key={stat.key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-amber-400 font-medium w-16 text-left">{homeVal}</span>
                    <span className="text-gray-400 text-xs uppercase flex-1 text-center">{stat.name}</span>
                    <span className="text-amber-400 font-medium w-16 text-right">{awayVal}</span>
                  </div>
                  <div className="flex h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                      style={{ width: `${homePercent}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-gray-600 to-gray-500 transition-all duration-500"
                      style={{ width: `${100 - homePercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Team Labels */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <img src={teams.home.logo} alt="" className="w-6 h-6 object-contain" />
              <span className="text-sm text-white font-medium">{teams.home.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium">{teams.away.name}</span>
              <img src={teams.away.logo} alt="" className="w-6 h-6 object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Match Info Grid */}

    </div>
  );
}