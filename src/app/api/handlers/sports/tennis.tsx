import MatchCard from '@/components/MatchCard';

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

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {matchData.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-gray-400 text-lg font-medium">
              Loading tennis matches...
            </div>
            <p className="text-gray-500 text-sm mt-2">
              Fetching live tennis scores and match data
            </p>
          </div>
        ) : (
          matchData.map((match: any) => (
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
                logo: match.homeTeam?.image || "/api/placeholder",
                goals: match.homeScore?.current ?? 0,
              }}
              awayTeam={{
                name: match.awayTeam?.shortName || match.awayTeam?.name || "Player 2",
                logo: match.awayTeam?.image || "/api/placeholder",
                goals: match.awayScore?.current ?? 0,
              }}
              status={{
                long: typeof match.status === 'string' ? match.status : 'Live',
                short: typeof match.status === 'string' ? match.status : undefined,
              }}
              href={`../match/tn${match.id}`}
            />
          ))
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
      "x-rapidapi-key": "e60478613emsh5570a46ef93e082p1752e5jsndf6235d350ab",
      "x-rapidapi-host": "tennisapi1.p.rapidapi.com",
    },
    next: { revalidate: 30 },
  });

  const json = await response.json();
  const match = json.event;

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

  return (
    <div className="bg-[#1a1a1a] w-full border border-white/10 rounded-3xl p-8 shadow-2xl">
      {/* Tournament Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/20 border border-emerald-400/30 rounded-full">
          <span className="text-2xl">🎾</span>
          <span className="text-emerald-400 font-bold text-lg">
            {match.tournament?.name || "Tennis Match"}
          </span>
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300">
            {match.groundType || "Indoor"}
          </span>
          {match.roundInfo?.name && (
            <span className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300">
              {match.roundInfo.name}
            </span>
          )}
        </div>
      </div>

      {/* Players & Main Score */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-8">
          {/* Home Player */}
          <div className="flex-1 text-center">
            <div className="mb-4">
              {match.homeTeam?.country?.alpha2 && (
                <div className="text-6xl mb-2">
                  {String.fromCodePoint(
                    ...[...match.homeTeam.country.alpha2.toUpperCase()].map(
                      (char) => 127397 + char.charCodeAt(0)
                    )
                  )}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {match.homeTeam?.name || "Player 1"}
            </h2>
            {match.homeTeam?.country?.name && (
              <p className="text-sm text-gray-400 mb-2">{match.homeTeam.country.name}</p>
            )}
            <div className="text-6xl font-black text-emerald-400">
              {match.homeScore?.current ?? 0}
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center">
            <div className="text-gray-500 font-bold text-2xl">VS</div>
            <div className="h-24 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent my-4"></div>
          </div>

          {/* Away Player */}
          <div className="flex-1 text-center">
            <div className="mb-4">
              {match.awayTeam?.country?.alpha2 && (
                <div className="text-6xl mb-2">
                  {String.fromCodePoint(
                    ...[...match.awayTeam.country.alpha2.toUpperCase()].map(
                      (char) => 127397 + char.charCodeAt(0)
                    )
                  )}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {match.awayTeam?.name || "Player 2"}
            </h2>
            {match.awayTeam?.country?.name && (
              <p className="text-sm text-gray-400 mb-2">{match.awayTeam.country.name}</p>
            )}
            <div className="text-6xl font-black text-emerald-400">
              {match.awayScore?.current ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Set by Set Scores */}
      {sets.length > 0 && (
        <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-4 text-center">Set Scores</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Player</th>
                  {sets.map((set) => (
                    <th key={set.set} className="py-3 px-4 text-gray-400 font-semibold text-sm">
                      Set {set.set}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-emerald-400 font-bold text-sm">Sets Won</th>
                </tr>
              </thead>
              <tbody>
                {/* Home Player Row */}
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-white font-semibold">
                    {match.homeTeam?.shortName || match.homeTeam?.name || "Player 1"}
                  </td>
                  {sets.map((set) => (
                    <td
                      key={set.set}
                      className={`py-4 px-4 font-bold ${
                        set.home > set.away ? "text-emerald-400" : "text-gray-300"
                      }`}
                    >
                      {set.home}
                    </td>
                  ))}
                  <td className="py-4 px-4 text-emerald-400 font-bold text-xl">
                    {match.homeScore?.current ?? 0}
                  </td>
                </tr>
                {/* Away Player Row */}
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-white font-semibold">
                    {match.awayTeam?.shortName || match.awayTeam?.name || "Player 2"}
                  </td>
                  {sets.map((set) => (
                    <td
                      key={set.set}
                      className={`py-4 px-4 font-bold ${
                        set.away > set.home ? "text-emerald-400" : "text-gray-300"
                      }`}
                    >
                      {set.away}
                    </td>
                  ))}
                  <td className="py-4 px-4 text-emerald-400 font-bold text-xl">
                    {match.awayScore?.current ?? 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Current Game Score */}
      {(match.homeScore?.point || match.awayScore?.point) && (
        <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-4 text-center">Current Game</h3>
          <div className="flex justify-center items-center gap-8">
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">
                {match.homeTeam?.shortName || "Player 1"}
              </div>
              <div className="text-4xl font-bold text-emerald-400">
                {match.homeScore?.point || "0"}
              </div>
            </div>
            <div className="text-gray-500">-</div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">
                {match.awayTeam?.shortName || "Player 2"}
              </div>
              <div className="text-4xl font-bold text-emerald-400">
                {match.awayScore?.point || "0"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Status */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center px-6 py-3 rounded-full text-base font-bold bg-emerald-900/30 text-emerald-400 border-2 border-emerald-400/30">
          {match.status?.description || "Live"}
        </span>
      </div>

      {/* Match Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tournament Info */}
        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Tournament</div>
              <div className="text-white font-medium">
                {match.tournament?.name || "Tennis Match"}
              </div>
              {match.season && (
                <div className="text-gray-400 text-sm">Season {match.season.year}</div>
              )}
            </div>
          </div>
        </div>

        {/* Match Type */}
        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎾</span>
            <div>
              <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Match Type</div>
              <div className="text-white font-medium">{match.groundType || "Indoor"}</div>
              {match.roundInfo?.name && (
                <div className="text-gray-400 text-sm">{match.roundInfo.name}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}