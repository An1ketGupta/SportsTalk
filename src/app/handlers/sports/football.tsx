import axios from 'axios';

export default async function FootballMatchesHandler() {
    const todaydate = new Date().toISOString().split("T")[0]
    const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
        params: {
            live: "61-39-78-135-140"
        },
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': '115c63a79ada64779433b7f133255804'
        },

    })
    const data = await response.data.response
    const matchData = Array.isArray(data)?data : []
    
    return <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {matchData.length === 0 ? (
      <p>Loading live matches...</p>
    ) : (
      matchData.map((match) => (
        <div
          key={match.fixture.id}
          className="border rounded-lg shadow p-4 flex flex-col justify-center items-center bg-gray-900 hover:bg-gray-800 transition"
        >
          <h2 className="text-lg font-bold mb-2">{match.league.name}</h2>
          <p className="text-sm text-gray-400 mb-2">{match.league.round}</p>
          <div className="flex justify-between items-center w-full mb-2">
            <div className="flex flex-col items-center">
              <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-12 h-12 mb-1" />
              <p>{match.teams.home.name}</p>
              <p className="font-bold">{match.goals.home}</p>
            </div>
            <p className="text-xl font-bold">vs</p>
            <div className="flex flex-col items-center">
              <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-12 h-12 mb-1" />
              <p>{match.teams.away.name}</p>
              <p className="font-bold">{match.goals.away}</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Status: {match.fixture.status.long} ({match.fixture.status.elapsed} min)
          </p>
          <p className="text-sm text-gray-400 mt-1">{new Date(match.fixture.date).toLocaleString()}</p>
        </div>
      ))
    )}
  </main>
}