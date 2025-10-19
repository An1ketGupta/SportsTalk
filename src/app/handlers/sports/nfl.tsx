import axios from 'axios';
export async function NFLMatchesHandler() {
    const todaydate = new Date().toISOString().split("T")[0]
    const options = {
        method: 'GET',
        url: 'https://v1.american-football.api-sports.io/games',
        params: { date: todaydate},
        headers: {
            'x-rapidapi-host': 'v1.american-football.api-sports.io',
            'x-rapidapi-key': '115c63a79ada64779433b7f133255804'
        }
    };

    const response = await axios.request(options)
    const data = await response.data.response
    const matchData = Array.isArray(data)?data:[]

    return <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {matchData.length === 0 && <p>No matches available.</p>}

    {matchData.map((item) => {
      const { game, league, teams, scores } = item;
      return (
        <div
          key={game.id}
          className="bg-gray-900 rounded-xl p-4 flex flex-col justify-between shadow-md"
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">{league.name} - {game.week}</h2>
            <span className="text-sm text-gray-400">{game.status.long}</span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col items-center">
              <img src={teams.home.logo} alt={teams.home.name} className="w-12 h-12 mb-1" />
              <span className="text-center">{teams.home.name}</span>
            </div>

            <div className="text-xl font-bold">
              {scores.home.total !== null ? `${scores.home.total} - ${scores.away.total}` : "VS"}
            </div>

            <div className="flex flex-col items-center">
              <img src={teams.away.logo} alt={teams.away.name} className="w-12 h-12 mb-1" />
              <span className="text-center">{teams.away.name}</span>
            </div>
          </div>

          <div className="text-sm text-gray-400 mt-2">
            <p>{game.date.date} {game.date.time} ({game.date.timezone})</p>
            <p>{game.venue.name}, {game.venue.city}</p>
          </div>
        </div>
      );
    })}
  </main>
}