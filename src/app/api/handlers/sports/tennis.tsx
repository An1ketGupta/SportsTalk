import MatchCard from '@/components/MatchCard';
import { sortByLiveStatus } from '@/lib/liveStatus';

export default async function TennisMatchesHandler() {
  const url = "https://tennisapi1.p.rapidapi.com/api/tennis/events/live";

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-key": "e60478613emsh5570a46ef93e082p1752e5jsndf6235d350ab",
      "x-rapidapi-host": "tennisapi1.p.rapidapi.com",
    },
    next: { revalidate: 30 },
  });

  const json = await response.json();
  const events = json.events;
  const matchData = Array.isArray(events) ? events : [];
  const sortedMatches = sortByLiveStatus(matchData, (match: any) => match?.status);

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {sortedMatches.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-gray-400 text-lg font-medium">No live matches available</div>
            <p className="text-gray-500 text-sm mt-2">No live tennis matches right now</p>
          </div>
        ) : (
          sortedMatches.map((match: any) => {
            // Generate player avatar URLs using country flag or initials
            const getPlayerImage = (team: any) => {
              if (team?.country?.alpha2) {
                return `https://flagcdn.com/w80/${team.country.alpha2.toLowerCase()}.png`;
              }
              const name = team?.shortName || team?.name || "Player";
              return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e293b&color=10b981&size=128&bold=true`;
            };

            return (
              <MatchCard
                key={match.id}
                matchId={match.id}
                league={{
                  name: match.tournament?.name || "Tennis Match",
                  emoji: "🎾",
                  round: match.groundType || "Indoor",
                }}
                homeTeam={{
                  name: match.homeTeam?.shortName || match.homeTeam?.name || "Player 1",
                  logo: getPlayerImage(match.homeTeam),
                  goals: match.homeScore?.current ?? 0,
                }}
                awayTeam={{
                  name: match.awayTeam?.shortName || match.awayTeam?.name || "Player 2",
                  logo: getPlayerImage(match.awayTeam),
                  goals: match.awayScore?.current ?? 0,
                }}
                status={{
                  long: typeof match.status === 'string' ? match.status : 'Live',
                  short: typeof match.status === 'string' ? match.status : undefined,
                }}
                href={`../match/tn${match.id}`}
              />
            );
          })
        )}
      </div>
    </main>
  );
}

export async function TennisMatchByIdHandler({ id }: { id: string }) {
  const url = `https://tennisapi1.p.rapidapi.com/api/tennis/event/${id}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_TENNIS_KEY!,
      "x-rapidapi-host": "tennisapi1.p.rapidapi.com",
    },
    next: { revalidate: 30 },
  });

  // Fetch match statistics
  const statsResponse = await fetch(`https://tennisapi1.p.rapidapi.com/api/tennis/event/${id}/statistics`, {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_TENNIS_KEY!,
      "x-rapidapi-host": "tennisapi1.p.rapidapi.com",
    },
    next: { revalidate: 30 },
  });

  const json = await response.json();
  const match = json.event;
  
  let statistics: any = null;
  try {
    const statsJson = await statsResponse.json();
    statistics = statsJson.statistics;
  } catch (e) {
    // Statistics may not be available for all matches
  }

  if (!match) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 text-lg font-medium">Match not found</div>
        <p className="text-gray-500 text-sm mt-2">Unable to load match data</p>
      </div>
    );
  }

  // Get set scores
  const sets = [];
  for (let i = 1; i <= 5; i++) {
    const homeScore = match.homeScore?.[`period${i}`];
    const awayScore = match.awayScore?.[`period${i}`];
    if (homeScore !== undefined || awayScore !== undefined) {
      sets.push({
        set: i,
        home: homeScore ?? 0,
        away: awayScore ?? 0,
      });
    }
  }

  // Calculate tiebreak info
  const homeTiebreaks = match.homeScore?.period1TieBreak || match.homeScore?.period2TieBreak || match.homeScore?.period3TieBreak;
  const awayTiebreaks = match.awayScore?.period1TieBreak || match.awayScore?.period2TieBreak || match.awayScore?.period3TieBreak;

  const isLive = match.status?.description?.toLowerCase().includes('live') || 
                 match.status?.description?.toLowerCase().includes('set') ||
                 match.status?.description?.toLowerCase().includes('game');
  const isFinished = match.status?.description?.toLowerCase().includes('ended') ||
                     match.status?.description?.toLowerCase().includes('finished');

  return (
    <div className="w-full space-y-4 p-4 md:p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎾</span>
          <div>
            <h1 className="text-white font-semibold text-lg">{match.tournament?.name || "Tennis Match"}</h1>
            <p className="text-gray-500 text-sm">{match.roundInfo?.name || match.tournament?.category?.name}</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
          isLive 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : isFinished 
              ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' 
              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        }`}>
          {isLive && <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse" />}
          {match.status?.description || "Scheduled"}
        </div>
      </div>

      {/* Venue */}
      <div className="flex items-center gap-2 text-gray-400 text-sm flex-wrap">
        {match.groundType && (
          <>
            <span>🏟️</span>
            <span>{match.groundType}</span>
          </>
        )}
        {match.startTimestamp && (
          <>
            {match.groundType && <span className="text-gray-600">•</span>}
            <span>{new Date(match.startTimestamp * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </>
        )}
      </div>

      {/* Main Scoreboard */}
      <div className="bg-[#111] rounded-2xl p-6 md:p-8 border border-white/5">
        <div className="grid grid-cols-3 items-center">
          {/* Home Player */}
          <div className="text-center">
            {match.homeTeam?.country?.alpha2 && (
              <div className="text-5xl md:text-6xl mb-3">
                {String.fromCodePoint(
                  ...[...match.homeTeam.country.alpha2.toUpperCase()].map(
                    (char) => 127397 + char.charCodeAt(0)
                  )
                )}
              </div>
            )}
            <h2 className="text-white font-medium text-sm md:text-base mb-1">{match.homeTeam?.name || "Player 1"}</h2>
            {match.homeTeam?.country?.name && (
              <p className="text-gray-500 text-xs mb-3">{match.homeTeam.country.name}</p>
            )}
            <p className="text-5xl md:text-7xl font-bold text-white tabular-nums">
              {match.homeScore?.current ?? 0}
            </p>
          </div>

          {/* Divider */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-12 bg-white/10" />
            <span className="text-gray-600 text-xs font-medium tracking-widest">VS</span>
            <div className="w-px h-12 bg-white/10" />
          </div>

          {/* Away Player */}
          <div className="text-center">
            {match.awayTeam?.country?.alpha2 && (
              <div className="text-5xl md:text-6xl mb-3">
                {String.fromCodePoint(
                  ...[...match.awayTeam.country.alpha2.toUpperCase()].map(
                    (char) => 127397 + char.charCodeAt(0)
                  )
                )}
              </div>
            )}
            <h2 className="text-white font-medium text-sm md:text-base mb-1">{match.awayTeam?.name || "Player 2"}</h2>
            {match.awayTeam?.country?.name && (
              <p className="text-gray-500 text-xs mb-3">{match.awayTeam.country.name}</p>
            )}
            <p className="text-5xl md:text-7xl font-bold text-white tabular-nums">
              {match.awayScore?.current ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Set Scores */}
      {sets.length > 0 && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-white text-sm font-medium">Set Scores</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 px-4 text-left text-gray-500 text-xs font-medium">Player</th>
                  {sets.map((set) => (
                    <th key={set.set} className="py-3 px-4 text-center text-gray-500 text-xs font-medium">
                      S{set.set}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center text-gray-500 text-xs font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-white text-sm">{match.homeTeam?.shortName || match.homeTeam?.name || "Player 1"}</td>
                  {sets.map((set) => (
                    <td key={set.set} className={`py-3 px-4 text-center tabular-nums font-medium ${set.home > set.away ? 'text-white' : 'text-gray-500'}`}>
                      {set.home}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center text-white font-semibold tabular-nums">{match.homeScore?.current ?? 0}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white text-sm">{match.awayTeam?.shortName || match.awayTeam?.name || "Player 2"}</td>
                  {sets.map((set) => (
                    <td key={set.set} className={`py-3 px-4 text-center tabular-nums font-medium ${set.away > set.home ? 'text-white' : 'text-gray-500'}`}>
                      {set.away}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center text-white font-semibold tabular-nums">{match.awayScore?.current ?? 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Current Game Score */}
      {(match.homeScore?.point || match.awayScore?.point) && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-white text-sm font-medium">Current Game</h3>
          </div>
          
          <div className="p-6">
            <div className="flex justify-center items-center gap-12">
              <div className="text-center">
                <div className="text-gray-500 text-xs mb-2">{match.homeTeam?.shortName || "P1"}</div>
                <div className="text-4xl font-bold text-white tabular-nums">{match.homeScore?.point || "0"}</div>
              </div>
              <div className="text-gray-600">–</div>
              <div className="text-center">
                <div className="text-gray-500 text-xs mb-2">{match.awayTeam?.shortName || "P2"}</div>
                <div className="text-4xl font-bold text-white tabular-nums">{match.awayScore?.point || "0"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Statistics */}
      {statistics && statistics.length > 0 && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-white text-sm font-medium">Match Statistics</h3>
          </div>
          
          <div className="p-4 space-y-6">
            {statistics[0]?.groups?.map((group: any, groupIdx: number) => (
              <div key={groupIdx}>
                <h4 className="text-gray-500 text-xs font-medium mb-3 uppercase tracking-wide">
                  {group.groupName}
                </h4>
                <div className="space-y-3">
                  {group.statisticsItems?.map((stat: any, statIdx: number) => {
                    const homeVal = Number(stat.home) || 0;
                    const awayVal = Number(stat.away) || 0;
                    const total = homeVal + awayVal || 1;
                    const homePercent = (homeVal / total) * 100;
                    
                    return (
                      <div key={statIdx}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className={`tabular-nums ${homeVal > awayVal ? 'text-white font-medium' : 'text-gray-400'}`}>{stat.home}</span>
                          <span className="text-gray-500 text-xs">{stat.name}</span>
                          <span className={`tabular-nums ${awayVal > homeVal ? 'text-white font-medium' : 'text-gray-400'}`}>{stat.away}</span>
                        </div>
                        <div className="flex h-1 bg-white/5 rounded-full overflow-hidden gap-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${homeVal >= awayVal ? 'bg-white' : 'bg-white/30'}`}
                            style={{ width: `${homePercent}%` }}
                          />
                          <div
                            className={`h-full rounded-full transition-all duration-500 flex-1 ${awayVal > homeVal ? 'bg-white' : 'bg-white/30'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}