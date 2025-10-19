import axios from "axios"

export default async function BasketballMatchesHandler(){
    const todayDate = new Date().toISOString().split("T")[0]
    const response = await axios.get("https://v1.basketball.api-sports.io/games",{
        params:{
            date:todayDate
        },
        headers:{
		"x-rapidapi-host": "v1.basketball.api-sports.io",
		"x-rapidapi-key": "115c63a79ada64779433b7f133255804"
	}
    })

    const data = await response.data.response
    const matchData = (Array.isArray(data) ? data : []);
    return (<div className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {matchData.length === 0 && (
          <div className="col-span-full text-center py-20">
            <div className="text-gray-400 text-lg font-medium">No live matches available</div>
            <p className="text-gray-500 text-sm mt-2">Check back later for upcoming games</p>
          </div>
        )}

        {matchData.map((match) => (
          <a 
            href={`../match/bb${match.id}`}
            key={match.id} 
            className="group bg-[#181818] hover:bg-[#1f1f1f] border border-white/5 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col"
          >
            {/* League Info */}
            <div className="text-center mb-4">
              <div className="text-sm font-medium text-blue-400 mb-1">
                🏀 {match.league?.name || 'Basketball League'}
              </div>
              <div className="text-xs text-gray-500">
                {match.date ? new Date(match.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                }) : 'Date TBA'}
              </div>
            </div>

            {/* Teams & Score */}
            <div className="flex justify-between items-center mb-4">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1">
                {match.teams?.home?.logo && (
                  <img 
                    src={match.teams.home.logo} 
                    alt={match.teams.home.name} 
                    className="w-14 h-14 mb-2 object-contain" 
                  />
                )}
                <div className="text-sm font-semibold text-center text-white mb-1">
                  {match.teams?.home?.name || 'Home Team'}
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {match.scores?.home?.total ?? 0}
                </div>
              </div>

              <div className="text-gray-400 font-bold text-lg px-3">VS</div>

              {/* Away Team */}
              <div className="flex flex-col items-center flex-1">
                {match.teams?.away?.logo && (
                  <img 
                    src={match.teams.away.logo} 
                    alt={match.teams.away.name} 
                    className="w-14 h-14 mb-2 object-contain" 
                  />
                )}
                <div className="text-sm font-semibold text-center text-white mb-1">
                  {match.teams?.away?.name || 'Away Team'}
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {match.scores?.away?.total ?? 0}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="text-center mt-auto">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                {match.status?.short || 'Live'}
              </span>
            </div>
          </a>
        ))}
      </div>)
}