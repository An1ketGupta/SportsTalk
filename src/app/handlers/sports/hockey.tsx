import axios from 'axios'

export default async function HocketMatchesHandler() {
    const todaydate = new Date().toISOString().split("T")[0]
    const response = await axios.get("https://v1.hockey.api-sports.io/games", {
        "headers": {
            "x-rapidapi-host": "v1.hockey.api-sports.io",
            "x-rapidapi-key": "115c63a79ada64779433b7f133255804"
        },
        params:{
            date:todaydate
        }
    })
    const data = await response.data.response
    const matchData = Array.isArray(data) ? data : [];
    return <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {matchData.length === 0 ? (
      <p>Loading Hockey games...</p>
    ) : (
      matchData.map((game: any) => {
        const gameDate = new Date(game.date);
        const formattedDate = gameDate.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const formattedTime = gameDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={game.id}
            className="border rounded-lg shadow p-4 flex flex-col gap-2 bg-gray-900"
          >
            {/* League & Country */}
            <p className="text-sm text-gray-400 font-medium">
              🏒 {game.league.name} ({game.country.name})
            </p>

            {/* Date & Time */}
            <p className="text-sm text-gray-500">
              🗓 {formattedDate} – {formattedTime} ({game.timezone})
            </p>

            {/* Teams & Scores */}
            <div className="flex items-center justify-between mt-2">
              {/* Home Team */}
              <div className="flex flex-col items-center">
                <img
                  src={game.teams.home.logo}
                  alt={game.teams.home.name}
                  className="w-12 h-12 object-contain mb-1"
                />
                <span className="text-sm font-semibold">{game.teams.home.name}</span>
                <span className="text-lg font-bold mt-1">{game.scores.home}</span>
              </div>

              <span className="text-xl font-bold">VS</span>

              {/* Away Team */}
              <div className="flex flex-col items-center">
                <img
                  src={game.teams.away.logo}
                  alt={game.teams.away.name}
                  className="w-12 h-12 object-contain mb-1"
                />
                <span className="text-sm font-semibold">{game.teams.away.name}</span>
                <span className="text-lg font-bold mt-1">{game.scores.away}</span>
              </div>
            </div>

            {/* Status */}
            <p className="text-xs text-blue-400 mt-2">Status: {game.status.long}</p>

            {/* Period Scores */}
            <div className="text-xs text-gray-400 mt-1">
              <p>1st: {game.periods.first}</p>
              <p>2nd: {game.periods.second}</p>
              <p>3rd: {game.periods.third}</p>
              {game.periods.overtime && <p>OT: {game.periods.overtime}</p>}
              {game.periods.penalties && <p>Penalties: {game.periods.penalties}</p>}
            </div>
          </div>
        );
      })
    )}
  </main>
}
