import axios from 'axios';

export default async function FootballMatchesHandler() {
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
    
    return <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {matchData.length === 0 ? (
      <div className="col-span-full text-center py-20">
        <div className="text-gray-400 text-lg font-medium">Loading live matches...</div>
        <p className="text-gray-500 text-sm mt-2">Fetching live football scores and match data</p>
      </div>
    ) : (
      matchData.map((match) => (
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
              <p className="text-sm font-semibold text-center text-white mb-1">{match.teams.home.name}</p>
              <p className="text-2xl font-bold text-green-400">{match.goals.home}</p>
            </div>
            
            <div className="text-gray-400 font-bold text-lg px-3">VS</div>
            
            {/* Away Team */}
            <div className="flex flex-col items-center flex-1">
              <img 
                src={match.teams.away.logo} 
                alt={match.teams.away.name} 
                className="w-14 h-14 mb-2 object-contain" 
              />
              <p className="text-sm font-semibold text-center text-white mb-1">{match.teams.away.name}</p>
              <p className="text-2xl font-bold text-green-400">{match.goals.away}</p>
            </div>
          </div>

          {/* Match Details */}
          <div className="space-y-2 text-xs text-gray-400 mb-4">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <span className="text-white font-medium">{match.fixture.status.long}</span>
            </div>
            {match.fixture.status.elapsed && (
              <div className="flex items-center justify-between">
                <span>Elapsed:</span>
                <span className="text-white font-medium">{match.fixture.status.elapsed} min</span>
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
              {match.fixture.status.short || 'Live'}
            </span>
          </div>
        </a>
      ))
    )}
  </main>
}