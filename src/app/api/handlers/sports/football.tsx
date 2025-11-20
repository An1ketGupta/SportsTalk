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
    <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <a
            key={match.fixture.id}
            href={`../match/fo${match.fixture.id}`}
            className="group bg-[#181818] hover:bg-[#1f1f1f] border border-white/5 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col"
          >
            {/* League Info */}
            <div className="text-center mb-4">
              <h2 className="text-sm font-medium text-green-400 mb-1">
                ⚽ {match.league.name}
              </h2>
              <p className="text-xs text-gray-500">{match.league.round}</p>
            </div>

            {/* Teams & Score */}
            <div className="flex justify-between items-center mb-4">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1">
                <img
                  src={match.teams.home.logo}
                  alt={match.teams.home.name}
                  className="w-14 h-14 mb-2 object-contain"
                />
                <p className="text-sm font-semibold text-center text-white mb-1">
                  {match.teams.home.name}
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {match.goals.home}
                </p>
              </div>

              <div className="text-gray-400 font-bold text-lg px-3">VS</div>

              {/* Away Team */}
              <div className="flex flex-col items-center flex-1">
                <img
                  src={match.teams.away.logo}
                  alt={match.teams.away.name}
                  className="w-14 h-14 mb-2 object-contain"
                />
                <p className="text-sm font-semibold text-center text-white mb-1">
                  {match.teams.away.name}
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {match.goals.away}
                </p>
              </div>
            </div>

            {/* Match Details */}
            <div className="space-y-2 text-xs text-gray-400 mb-4">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className="text-white font-medium">
                  {match.fixture.status.long}
                </span>
              </div>
              {match.fixture.status.elapsed && (
                <div className="flex items-center justify-between">
                  <span>Elapsed:</span>
                  <span className="text-white font-medium">
                    {match.fixture.status.elapsed} min
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span>🗓</span>
                <span>{new Date(match.fixture.date).toLocaleString()}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="text-center mt-auto">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-400/20">
                {match.fixture.status.short || "Live"}
              </span>
            </div>
          </a>
        ))
      )}
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

  const homeLineup = lineups.find((l: any) => l?.team?.id === home?.id);
  const awayLineup = lineups.find((l: any) => l?.team?.id === away?.id);

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 flex flex-col items-center">
            <img src={home?.logo} alt={home?.name} className="w-16 h-16 object-contain mb-2" />
            <div className="text-sm text-gray-300 text-center">{home?.name}</div>
          </div>
          <div className="flex flex-col items-center min-w-[140px]">
            <div className="text-4xl font-extrabold text-green-400">
              {goals?.home ?? 0} - {goals?.away ?? 0}
            </div>
            <div className="mt-1 text-xs text-gray-400">
              {status?.long} {status?.elapsed ? `• ${status.elapsed}'` : ""}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <img src={away?.logo} alt={away?.name} className="w-16 h-16 object-contain mb-2" />
            <div className="text-sm text-gray-300 text-center">{away?.name}</div>
          </div>
        </div>
      </div>

      {/* Events */}
      <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Events</h3>
          <span className="text-xs text-gray-400">{events.length} events</span>
        </div>
        {events.length === 0 ? (
          <div className="text-sm text-gray-400">No events yet.</div>
        ) : (
          <div className="space-y-3">
            {events.map((ev: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="text-xs text-gray-400 w-10 text-right">{ev?.time?.elapsed}'</div>
                <img src={ev?.team?.logo} alt={ev?.team?.name} className="w-5 h-5 object-contain opacity-80" />
                <div className="flex-1 text-sm text-gray-200">
                  <span className="text-white font-medium">{ev?.player?.name}</span>
                  <span className="text-gray-400"> — {ev?.type}</span>
                  {ev?.detail ? <span className="text-gray-500"> ({ev.detail})</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lineups */}
      <div id="lineups" className="bg-[#181818] border border-white/5 rounded-2xl p-6 shadow-lg">
        <h3 className="text-white font-semibold mb-4">Lineups</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Lineup */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <img src={home?.logo} alt={home?.name} className="w-6 h-6 object-contain" />
                <span className="text-sm text-white font-medium">{home?.name}</span>
              </div>
              {homeLineup?.formation ? (
                <span className="text-xs text-gray-400">{homeLineup.formation}</span>
              ) : null}
            </div>
            <div className="rounded-xl border border-white/5">
              <div className="p-3 border-b border-white/5 text-xs text-gray-400">Starting XI</div>
              <ul className="max-h-80 overflow-auto divide-y divide-white/5 scrollbar-hide">
                {(homeLineup?.startXI || []).map((p: any, i: number) => (
                  <li key={i} className="p-3 text-sm text-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6 text-right">{p?.player?.number}</span>
                      <span className="text-white">{p?.player?.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{p?.player?.pos}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Away Lineup */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <img src={away?.logo} alt={away?.name} className="w-6 h-6 object-contain" />
                <span className="text-sm text-white font-medium">{away?.name}</span>
              </div>
              {awayLineup?.formation ? (
                <span className="text-xs text-gray-400">{awayLineup.formation}</span>
              ) : null}
            </div>
            <div className="rounded-xl border border-white/5">
              <div className="p-3 border-b border-white/5 text-xs text-gray-400">Starting XI</div>
              <ul className="max-h-80 overflow-auto divide-y divide-white/5 scrollbar-hide">
                {(awayLineup?.startXI || []).map((p: any, i: number) => (
                  <li key={i} className="p-3 text-sm text-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-6 text-right">{p?.player?.number}</span>
                      <span className="text-white">{p?.player?.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{p?.player?.pos}</span>
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
