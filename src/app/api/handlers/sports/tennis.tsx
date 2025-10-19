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
    
    return (<main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {matchData.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-gray-400 text-lg font-medium">Loading tennis matches...</div>
            <p className="text-gray-500 text-sm mt-2">Fetching live tennis scores and match data</p>
          </div>
        ) : (
          matchData.map((match) => (
            <a key={match.id}
              href={`/livematches/tennis/tn${match.id}`}
              className="group bg-[#181818] hover:bg-[#1f1f1f] border border-white/5 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col"
            >
              {/* Tournament Header */}
              <div className="text-center mb-4">
                <h3 className="text-sm font-medium text-emerald-400 mb-1 truncate">
                  🎾 {match.tournament?.name || "Tennis Match"}
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-700 text-gray-300">
                  {match.groundType || "Indoor"}
                </span>
              </div>

              {/* Players & Score */}
              <div className="flex flex-col items-center gap-3 mb-4">
                {/* Home Player */}
                <div className="text-center">
                  <div className="font-medium text-white text-sm mb-1">
                    {match.homeTeam?.shortName || match.homeTeam?.name || 'Player 1'}
                    {match.homeTeam?.country && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({match.homeTeam.country.alpha2})
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-3xl font-bold text-emerald-400 tracking-wide">
                  {match.homeScore?.current ?? 0} - {match.awayScore?.current ?? 0}
                </div>

                {/* Away Player */}
                <div className="text-center">
                  <div className="font-medium text-white text-sm mb-1">
                    {match.awayTeam?.shortName || match.awayTeam?.name || 'Player 2'}
                    {match.awayTeam?.country && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({match.awayTeam.country.alpha2})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Details */}
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Round:</span>
                    <span className="text-white font-medium">{match.roundInfo?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Points:</span>
                    <span className="text-white font-medium">
                      {match.homeScore?.point || "0"} - {match.awayScore?.point || "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="text-center mt-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-400/20">
                  {match.status?.description || "Live"}
                </span>
              </div>
            </a>
          ))
        )}
      </main>)
}