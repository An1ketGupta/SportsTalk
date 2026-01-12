import MatchCard from "@/components/MatchCard";
import { sortByLiveStatus } from "@/lib/liveStatus";

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
  const sortedMatches = sortByLiveStatus(matchData, (match: any) => match?.fixture?.status);

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {sortedMatches.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-gray-400 text-lg font-medium">No live matches available</div>
            <p className="text-gray-500 text-sm mt-2">No live football matches right now</p>
          </div>
        ) : (
          sortedMatches.map((match: any) => (
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

  const isGameLive = status?.short !== "FT" && status?.short !== "NS";
  const isGameFinished = status?.short === "FT";

  return (
    <div className="w-full space-y-4 p-4 md:p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={data.league?.logo} alt="" className="w-6 h-6 object-contain" />
          <div>
            <h1 className="text-white font-semibold text-lg">{data.league?.name}</h1>
            <p className="text-gray-500 text-sm">{data.league?.round}</p>
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
          {isGameFinished ? "Full Time" : isGameLive ? `${status?.elapsed}'` : status?.long || "Scheduled"}
        </div>
      </div>

      {/* Venue */}
      {fixture.venue && (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span>📍</span>
          <span>{fixture.venue.name}, {fixture.venue.city}</span>
          {fixture.date && (
            <>
              <span className="text-gray-600">•</span>
              <span>{new Date(fixture.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </>
          )}
        </div>
      )}

      {/* Main Scoreboard */}
      <div className="bg-[#111] rounded-2xl p-6 md:p-8 border border-white/5">
        <div className="grid grid-cols-3 items-center">
          {/* Home Team */}
          <div className="text-center">
            <img 
              src={home?.logo} 
              alt={home?.name} 
              className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain mb-3" 
            />
            <h2 className="text-white font-medium text-sm md:text-base mb-2">{home?.name}</h2>
            <p className="text-5xl md:text-7xl font-bold text-white tabular-nums">
              {goals?.home ?? 0}
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
              src={away?.logo} 
              alt={away?.name} 
              className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain mb-3" 
            />
            <h2 className="text-white font-medium text-sm md:text-base mb-2">{away?.name}</h2>
            <p className="text-5xl md:text-7xl font-bold text-white tabular-nums">
              {goals?.away ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Match Statistics */}
      {statistics.length > 0 && homeStats?.statistics && awayStats?.statistics && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-white text-sm font-medium">Match Stats</h3>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <img src={home?.logo} alt="" className="w-4 h-4 object-contain" />
                <span className="hidden sm:inline">{home?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">{away?.name}</span>
                <img src={away?.logo} alt="" className="w-4 h-4 object-contain" />
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {homeStats.statistics.slice(0, 8).map((stat: any, idx: number) => {
              const awayStat = awayStats.statistics[idx];
              const homeValue = typeof stat.value === 'string' ? parseInt(stat.value) || 0 : stat.value || 0;
              const awayValue = typeof awayStat?.value === 'string' ? parseInt(awayStat.value) || 0 : awayStat?.value || 0;
              const total = homeValue + awayValue || 1;
              const homePercent = (homeValue / total) * 100;

              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className={`tabular-nums ${homeValue > awayValue ? 'text-white font-medium' : 'text-gray-400'}`}>{stat.value || 0}</span>
                    <span className="text-gray-500 text-xs">{stat.type}</span>
                    <span className={`tabular-nums ${awayValue > homeValue ? 'text-white font-medium' : 'text-gray-400'}`}>{awayStat?.value || 0}</span>
                  </div>
                  <div className="flex h-1 bg-white/5 rounded-full overflow-hidden gap-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${homeValue >= awayValue ? 'bg-white' : 'bg-white/30'}`}
                      style={{ width: `${homePercent}%` }}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-500 flex-1 ${awayValue > homeValue ? 'bg-white' : 'bg-white/30'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Events */}
      {events.length > 0 && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-white text-sm font-medium">Match Events</h3>
            <span className="text-gray-500 text-xs">{events.length} events</span>
          </div>
          
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto scrollbar-hide">
            {events.map((ev: any, idx: number) => {
              const isGoal = ev?.type === 'Goal';
              const isCard = ev?.type === 'Card';
              
              return (
                <div key={idx} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-3">
                    <img src={ev?.team?.logo} alt="" className="w-5 h-5 object-contain mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <span>{ev?.time?.elapsed}'</span>
                        <span>•</span>
                        <span>{ev?.type}</span>
                        {isGoal && <span>⚽</span>}
                        {isCard && ev?.detail === 'Yellow Card' && <span>🟨</span>}
                        {isCard && ev?.detail === 'Red Card' && <span>🟥</span>}
                      </div>
                      <p className="text-white text-sm">{ev?.player?.name}</p>
                      {ev?.assist?.name && (
                        <p className="text-gray-500 text-xs mt-0.5">Assist: {ev.assist.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lineups */}
      {(homeLineup || awayLineup) && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-white text-sm font-medium">Lineups</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {/* Home Lineup */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img src={home?.logo} alt="" className="w-4 h-4 object-contain" />
                  <span className="text-gray-500 text-xs">{home?.name}</span>
                </div>
                {homeLineup?.formation && (
                  <span className="text-xs text-gray-500">{homeLineup.formation}</span>
                )}
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-hide">
                {(homeLineup?.startXI || []).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs w-5">{p?.player?.number}</span>
                      <span className="text-white">{p?.player?.name}</span>
                    </div>
                    <span className="text-gray-500 text-xs">{p?.player?.pos}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Away Lineup */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img src={away?.logo} alt="" className="w-4 h-4 object-contain" />
                  <span className="text-gray-500 text-xs">{away?.name}</span>
                </div>
                {awayLineup?.formation && (
                  <span className="text-xs text-gray-500">{awayLineup.formation}</span>
                )}
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-hide">
                {(awayLineup?.startXI || []).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs w-5">{p?.player?.number}</span>
                      <span className="text-white">{p?.player?.name}</span>
                    </div>
                    <span className="text-gray-500 text-xs">{p?.player?.pos}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
