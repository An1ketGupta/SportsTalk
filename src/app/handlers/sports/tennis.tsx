import axios from 'axios';

export default async function TennisMatchesHandler() {

    const options = {
        method: 'GET',
        url: 'https://tennisapi1.p.rapidapi.com/api/tennis/events/live',
        headers: {
            'x-rapidapi-key': 'e60478613emsh5570a46ef93e082p1752e5jsndf6235d350ab',
            'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
        }
    };

    const response = await axios.request(options);
    const events = await response.data.events
    const matchData = (Array.isArray(events) ? events : []);
    
    return (<main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6">
        {matchData.length === 0 ? (
          <p className="text-center text-gray-500">Fetching live data...</p>
        ) : (
          <a className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {matchData.map((match) => (
              <a key={match.id}
                href={`/livematches/tennis/${match.id}`}
                className="bg-[#181818] rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border border-white/5 p-5"
              >
                {/* Tournament */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {match.tournament?.name || "Unknown Tournament"}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-md bg-gray-700 text-gray-300">
                    {match.groundType || "Indoor"}
                  </span>
                </div>

                {/* Teams + Score */}
                <div className="flex flex-col items-center gap-3">
                  {/* Home */}
                  <div className="font-medium text-center text-white">
                    {match.homeTeam?.shortName || match.homeTeam?.name}
                    {match.homeTeam?.country && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({match.homeTeam.country.alpha2})
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-2xl font-bold text-blue-500 tracking-wide">
                    {match.homeScore?.current ?? 0} - {match.awayScore?.current ?? 0}
                  </div>

                  {/* Away */}
                  <div className="font-medium text-center text-white">
                    {match.awayTeam?.shortName || match.awayTeam?.name}
                    {match.awayTeam?.country && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({match.awayTeam.country.alpha2})
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Info */}
                <div className="text-xs sm:text-sm text-gray-400 mt-3 flex flex-wrap justify-center gap-4">
                  <span>Round: {match.roundInfo?.name || "-"}</span>
                  <span>Status: {match.status?.description || "Live"}</span>
                  <span>
                    Points: {match.homeScore?.point || "0"} - {match.awayScore?.point || "0"}
                  </span>
                </div>
              </a>
            ))}
          </a>
        )}
      </main>)
}