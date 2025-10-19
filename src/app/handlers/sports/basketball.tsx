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
    return (<div className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchData.length === 0 && (
          <div className="text-gray-400 col-span-full text-center py-20">
            No live matches available
          </div>
        )}

        {matchData.map((match) => (
          <a href={`/livematches/basketball/${match.id}`} key={match.id} className="bg-gray-900 p-4 rounded-lg shadow-md flex flex-col items-center">
            <div className="text-sm text-gray-400 mb-2">
              {match.league?.name} - {match.date?.split("T")[0]}
            </div>

            <div className="flex justify-between w-full items-center mb-2">
              {/* Home Team */}
              <div className="flex flex-col items-center">
                {match.teams?.home?.logo && (
                  <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-12 h-12 mb-1" />
                )}
                <div className="font-bold">{match.teams?.home?.name}</div>
                <div className="text-lg">{match.scores?.home?.total ?? 0}</div>
              </div>

              <div className="text-gray-300 font-semibold">vs</div>

              {/* Away Team */}
              <div className="flex flex-col items-center">
                {match.teams?.away?.logo && (
                  <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-12 h-12 mb-1" />
                )}
                <div className="font-bold">{match.teams?.away?.name}</div>
                <div className="text-lg">{match.scores?.away?.total ?? 0}</div>
              </div>
            </div>

            <div className="text-sm text-gray-300">{match.status?.short}</div>
          </a>
        ))}
      </div>)
}