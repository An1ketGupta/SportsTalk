export async function NFLMatchesHandler({
  id,
}: {
  id: string;
}) {
  const todaydate = new Date().toISOString().split("T")[0];
  // @ts-ignore
  const url = id.length>0
    ? `https://v1.american-football.api-sports.io/games?id=${id}`
    : `https://v1.american-football.api-sports.io/games?date=${todaydate}`;

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


export async function MatchByIdHAndler({
  id
}:{
  id:string
}){

}