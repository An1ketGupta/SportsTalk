import MatchCard from "@/components/MatchCard";

export default async function FootballMatchesHandler() {
  const response = await fetch(
    "https://v3.football.api-sports.io/fixtures?live=61-39-78-135-140",
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": "115c63a79ada64779433b7f133255804",
      },
      next: { revalidate: 30 }, // cache for 30 seconds
    }
  );

  const json = await response.json();
  const data = json.response;
  const matchData = Array.isArray(data) ? data : [];

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {matchData.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-gray-400 text-lg font-medium">
              Loading live matches...
            </div>
            <p className="text-gray-500 text-sm mt-2">
              Fetching live football scores and match data
            </p>
          </div>
        ) : (
          matchData.map((match: any) => (
            <MatchCard
              key={match.fixture.id}
              matchId={match.fixture.id}
              league={{
                name: match.league.name,
                emoji: "⚽",
                round: match.league.round,
              }}
              homeTeam={{
                name: match.teams.home.name,
                logo: match.teams.home.logo,
                goals: match.goals.home,
              }}
              awayTeam={{
                name: match.teams.away.name,
                logo: match.teams.away.logo,
                goals: match.goals.away,
              }}
              status={{
                long: match.fixture.status.long,
                short: match.fixture.status.short,
                elapsed: match.fixture.status.elapsed,
              }}
              venue={match.fixture.venue?.name}
              href={`../match/fo${match.fixture.id}`}
            />
          ))
        )}
      </div>
    </main>
  );
}

export async function FootballMatchByIdHandler({
  id
}: {
  id: string
}) {
  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures?id=${id}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": "115c63a79ada64779433b7f133255804",
      },
      next: { revalidate: 30 }, // cache for 30 seconds
    }
  );
  const matchData = await response.json();
  const data = Array.isArray(matchData?.response) ? matchData.response[0] : null;

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300">
        <div className="h-6 w-6 rounded-full border-2 border-gray-500 border-t-transparent animate-spin mb-3" />
        <p className="text-sm">Loading match...</p>
      </div>
    );
  }

  const home = data.teams?.home;
  const away = data.teams?.away;
  const goals = data.goals || { home: 0, away: 0 };
  const status = data.fixture?.status || {};
  const events = Array.isArray(data.events) ? data.events : [];
  const lineups = Array.isArray(data.lineups) ? data.lineups : [];
  const statistics = Array.isArray(data.statistics) ? data.statistics : [];
  const fixture = data.fixture || {};

  const homeLineup = lineups.find((l: any) => l?.team?.id === home?.id);
  const awayLineup = lineups.find((l: any) => l?.team?.id === away?.id);
  const homeStats = statistics.find((s: any) => s?.team?.id === home?.id);
  const awayStats = statistics.find((s: any) => s?.team?.id === away?.id);

  return (
    <div className="space-y-6">
      {/* Match Header with League Info */}
      <div className="bg-gradient-to-br from-blue-900/20 via-gray-900/50 to-gray-900/30 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 shadow-lg">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src={data.league?.logo} alt={data.league?.name} className="w-8 h-8 object-contain" />
            <h2 className="text-lg font-bold text-blue-400">{data.league?.name}</h2>
          </div>
          <p className="text-sm text-gray-400">{data.league?.round}</p>
          {fixture.venue && (
            <p className="text-xs text-gray-500 mt-2">
              📍 {fixture.venue.name}, {fixture.venue.city}
            </p>
          )}
          {fixture.date && (
            <p className="text-xs text-gray-500 mt-1">
              🗓 {new Date(fixture.date).toLocaleString()}
            </p>
          )}
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 flex flex-col items-center">
            <img src={home?.logo} alt={home?.name} className="w-20 h-20 object-contain mb-3 drop-shadow-lg" />
            <div className="text-base font-semibold text-white text-center">{home?.name}</div>
          </div>
          <div className="flex flex-col items-center min-w-[160px]">
            <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              {goals?.home ?? 0} - {goals?.away ?? 0}
            </div>
            <div className="mt-2 px-4 py-1 bg-blue-500/20 rounded-full">
              <span className="text-sm font-semibold text-blue-400">
                {status?.long} {status?.elapsed ? `• ${status.elapsed}'` : ""}
              </span>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <img src={away?.logo} alt={away?.name} className="w-20 h-20 object-contain mb-3 drop-shadow-lg" />
            <div className="text-base font-semibold text-white text-center">{away?.name}</div>
          </div>
        </div>
      </div>

      {/* Match Statistics */}
      {statistics.length > 0 && homeStats?.statistics && awayStats?.statistics && (
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 shadow-lg">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>📊</span> Match Statistics
          </h3>
          <div className="space-y-4">
            {homeStats.statistics.map((stat: any, idx: number) => {
              const awayStat = awayStats.statistics[idx];
              const homeValue = typeof stat.value === 'string' ? parseInt(stat.value) || 0 : stat.value || 0;
              const awayValue = typeof awayStat?.value === 'string' ? parseInt(awayStat.value) || 0 : awayStat?.value || 0;
              const total = homeValue + awayValue || 1;
              const homePercent = (homeValue / total) * 100;
              const awayPercent = (awayValue / total) * 100;

              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-blue-400 font-medium">{homeValue}</span>
                    <span className="text-gray-400 text-xs uppercase">{stat.type}</span>
                    <span className="text-blue-400 font-medium">{awayValue}</span>
                  </div>
                  <div className="flex gap-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                      style={{ width: `${homePercent}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-gray-600 to-gray-500 transition-all duration-500"
                      style={{ width: `${awayPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Events */}
      <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span>⚡</span> Match Events
          </h3>
          <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
            {events.length} events
          </span>
        </div>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">⚽</div>
            <p className="text-sm">No events recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev: any, idx: number) => {
              const isGoal = ev?.type === 'Goal';
              const isCard = ev?.type === 'Card';
              const isSubstitution = ev?.type === 'subst';
              
              return (
                <div 
                  key={idx} 
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isGoal ? 'bg-green-500/10 border border-green-500/20' :
                    isCard && ev?.detail === 'Red Card' ? 'bg-red-500/10 border border-red-500/20' :
                    isCard ? 'bg-yellow-500/10 border border-yellow-500/20' :
                    'bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-900 rounded-lg border border-white/10">
                    <span className="text-sm font-bold text-blue-400">{ev?.time?.elapsed}'</span>
                  </div>
                  <img 
                    src={ev?.team?.logo} 
                    alt={ev?.team?.name} 
                    className="w-8 h-8 object-contain" 
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{ev?.player?.name}</span>
                      {isGoal && <span className="text-xl">⚽</span>}
                      {isCard && ev?.detail === 'Yellow Card' && <span className="text-xl">🟨</span>}
                      {isCard && ev?.detail === 'Red Card' && <span className="text-xl">🟥</span>}
                      {isSubstitution && <span className="text-xl">🔄</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      <span className="font-medium text-blue-400">{ev?.type}</span>
                      {ev?.detail && <span className="text-gray-500"> • {ev.detail}</span>}
                      {ev?.assist?.name && (
                        <span className="text-gray-400"> • Assist: {ev.assist.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lineups */}
      <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 shadow-lg">
        <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
          <span>👥</span> Team Lineups
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Lineup */}
          <div>
            <div className="flex items-center justify-between mb-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2">
                <img src={home?.logo} alt={home?.name} className="w-7 h-7 object-contain" />
                <span className="text-sm text-white font-semibold">{home?.name}</span>
              </div>
              {homeLineup?.formation && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  {homeLineup.formation}
                </span>
              )}
            </div>
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <div className="p-3 bg-gray-900/50 border-b border-white/5 text-xs font-semibold text-gray-400 uppercase">
                Starting XI
              </div>
              <ul className="max-h-96 overflow-auto divide-y divide-white/5">
                {(homeLineup?.startXI || []).map((p: any, i: number) => (
                  <li 
                    key={i} 
                    className="p-3 hover:bg-gray-800/30 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded text-xs font-bold">
                        {p?.player?.number}
                      </div>
                      <span className="text-sm text-white group-hover:text-blue-400 transition-colors">
                        {p?.player?.name}
                      </span>
                    </div>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                      {p?.player?.pos}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Away Lineup */}
          <div>
            <div className="flex items-center justify-between mb-3 p-3 bg-gray-700/10 rounded-lg border border-gray-600/20">
              <div className="flex items-center gap-2">
                <img src={away?.logo} alt={away?.name} className="w-7 h-7 object-contain" />
                <span className="text-sm text-white font-semibold">{away?.name}</span>
              </div>
              {awayLineup?.formation && (
                <span className="text-xs bg-gray-600/20 text-gray-400 px-2 py-1 rounded">
                  {awayLineup.formation}
                </span>
              )}
            </div>
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <div className="p-3 bg-gray-900/50 border-b border-white/5 text-xs font-semibold text-gray-400 uppercase">
                Starting XI
              </div>
              <ul className="max-h-96 overflow-auto divide-y divide-white/5">
                {(awayLineup?.startXI || []).map((p: any, i: number) => (
                  <li 
                    key={i} 
                    className="p-3 hover:bg-gray-800/30 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 flex items-center justify-center bg-gray-600/20 text-gray-400 rounded text-xs font-bold">
                        {p?.player?.number}
                      </div>
                      <span className="text-sm text-white group-hover:text-blue-400 transition-colors">
                        {p?.player?.name}
                      </span>
                    </div>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                      {p?.player?.pos}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
