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
  return (
    <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {matchData.length === 0 ? (
        <div className="col-span-full text-center py-20">
          <div className="text-gray-400 text-lg font-medium">
            Loading NFL games...
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Fetching live football scores and game data
          </p>
        </div>
      ) : (
        matchData.map((item: any) => {
          const { game, league, teams, scores } = item;

          return (
            <a
              href={`../match/nf${game.id}`}
              key={game.id}
              className="group bg-[#181818] hover:bg-[#1f1f1f] border border-white/5 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col"
            >
              {/* Game Header */}
              <div className="text-center mb-4">
                <div className="text-sm font-medium text-amber-400 mb-1">
                  🏈 {league.name} - Week {game.week}
                </div>
              </div>

              {/* Teams & Score */}
              <div className="flex justify-between items-center mb-4">
                {/* Home Team */}
                <div className="flex flex-col items-center flex-1">
                  <img
                    src={teams.home.logo}
                    alt={teams.home.name}
                    className="w-14 h-14 object-contain mb-2"
                  />
                  <span className="text-sm font-semibold text-center text-white mb-1">
                    {teams.home.name}
                  </span>
                  <span className="text-2xl font-bold text-amber-400">
                    {scores.home.total ?? 0}
                  </span>
                </div>

                <span className="text-gray-400 font-bold text-lg px-3">VS</span>

                {/* Away Team */}
                <div className="flex flex-col items-center flex-1">
                  <img
                    src={teams.away.logo}
                    alt={teams.away.name}
                    className="w-14 h-14 object-contain mb-2"
                  />
                  <span className="text-sm font-semibold text-center text-white mb-1">
                    {teams.away.name}
                  </span>
                  <span className="text-2xl font-bold text-amber-400">
                    {scores.away.total ?? 0}
                  </span>
                </div>
              </div>

              {/* Game Details */}
              <div className="space-y-2 text-xs text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <span>🏟</span>
                  <span>
                    {game.venue.name}, {game.venue.city}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🗓</span>
                  <span>
                    {game.date.date} {game.date.time} ({game.date.timezone})
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="text-center mt-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-400/20">
                  {game.status.long || "Scheduled"}
                </span>
              </div>
            </a>
          );
        })
      )}
    </main>
  );
}


export async function NFLMatchByIdHAndler({
  id
}:{
  id:string
}){
  const url = `https://v1.american-football.api-sports.io/games?id=${id}`
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

  return ( <div className="bg-[#1a1a1a] w-full border border-white/10 rounded-3xl p-8 shadow-2xl">
        {/* League & Week Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900/20 border border-amber-400/30 rounded-full">
            <span className="text-2xl">🏈</span>
            <span className="text-amber-400 font-bold text-lg">
              {league.name}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300 font-medium">Week {game.week}</span>
          </div>
        </div>

        {/* Teams & Main Score */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-8">
            {/* Home Team */}
            <div className="flex-1 text-center">
              <div className="mb-4">
                <img
                  src={teams.home.logo}
                  alt={teams.home.name}
                  className="w-32 h-32 mx-auto object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {teams.home.name}
              </h2>
              <div className="text-6xl font-black text-amber-400">
                {scores.home.total ?? 0}
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex flex-col items-center">
              <div className="text-gray-500 font-bold text-2xl">VS</div>
              <div className="h-24 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent my-4"></div>
            </div>

            {/* Away Team */}
            <div className="flex-1 text-center">
              <div className="mb-4">
                <img
                  src={teams.away.logo}
                  alt={teams.away.name}
                  className="w-32 h-32 mx-auto object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {teams.away.name}
              </h2>
              <div className="text-6xl font-black text-amber-400">
                {scores.away.total ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Quarter by Quarter Scores */}
        <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-4 text-center">
            Score Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Team</th>
                  <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Q1</th>
                  <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Q2</th>
                  <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Q3</th>
                  <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Q4</th>
                  {scores.home.overtime !== null && (
                    <th className="py-3 px-4 text-gray-400 font-semibold text-sm">OT</th>
                  )}
                  <th className="py-3 px-4 text-amber-400 font-bold text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {/* Home Team Row */}
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-white font-semibold">{teams.home.name}</td>
                  <td className="py-4 px-4 text-gray-300">{scores.home.quarter_1 ?? 0}</td>
                  <td className="py-4 px-4 text-gray-300">{scores.home.quarter_2 ?? 0}</td>
                  <td className="py-4 px-4 text-gray-300">{scores.home.quarter_3 ?? 0}</td>
                  <td className="py-4 px-4 text-gray-300">{scores.home.quarter_4 ?? 0}</td>
                  {scores.home.overtime !== null && (
                    <td className="py-4 px-4 text-gray-300">{scores.home.overtime ?? 0}</td>
                  )}
                  <td className="py-4 px-4 text-amber-400 font-bold text-xl">{scores.home.total ?? 0}</td>
                </tr>
                {/* Away Team Row */}
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-white font-semibold">{teams.away.name}</td>
                  <td className="py-4 px-4 text-gray-300">{scores.away.quarter_1 ?? 0}</td>
                  <td className="py-4 px-4 text-gray-300">{scores.away.quarter_2 ?? 0}</td>
                  <td className="py-4 px-4 text-gray-300">{scores.away.quarter_3 ?? 0}</td>
                  <td className="py-4 px-4 text-gray-300">{scores.away.quarter_4 ?? 0}</td>
                  {scores.away.overtime !== null && (
                    <td className="py-4 px-4 text-gray-300">{scores.away.overtime ?? 0}</td>
                  )}
                  <td className="py-4 px-4 text-amber-400 font-bold text-xl">{scores.away.total ?? 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Game Status */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center px-6 py-3 rounded-full text-base font-bold bg-amber-900/30 text-amber-400 border-2 border-amber-400/30">
            {game.status.short === "FT" ? "🏁 Final" : game.status.long || "Scheduled"}
          </span>
        </div>

        {/* Match Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Venue */}
          <div className="bg-black/20 rounded-lg p-4 border border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏟️</span>
              <div>
                <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Venue</div>
                <div className="text-white font-medium">{game.venue.name}</div>
                <div className="text-gray-400 text-sm">{game.venue.city}</div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-black/20 rounded-lg p-4 border border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📅</span>
              <div>
                <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Date & Time</div>
                <div className="text-white font-medium">{game.date.date}</div>
                <div className="text-gray-400 text-sm">
                  {game.date.time} ({game.date.timezone})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}