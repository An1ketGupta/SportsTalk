import axios from 'axios'

export default async function MMAMatchesHandler() {
    const todaydate = new Date().toISOString().split("T")[0]
    const response = await axios.get('https://v1.mma.api-sports.io/fights', {
        params: { date: todaydate },
        headers: {
            'x-rapidapi-host': 'v1.mma.api-sports.io',
            'x-rapidapi-key': '115c63a79ada64779433b7f133255804'
        }
    })
    
    const data = await response.data.response
    const matchData = (Array.isArray(data) ? data : []);

    return (<div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {matchData.length > 0 ? (
          matchData.map((fight: any) => (
            <div
              key={fight.id}
              className="bg-[#1a1a1a] rounded-2xl p-5 shadow-lg border border-white/10 hover:scale-[1.02] transition-transform"
            >
              {/* Event Info */}
              <p className="text-xs text-gray-400 mb-2">
                {new Date(fight.date).toLocaleString()} • {fight.category}
              </p>
              <h2 className="text-lg font-bold text-white mb-4">
                {fight.slug}
              </h2>

              {/* Fighters */}
              <div className="flex items-center justify-between gap-3">
                {/* First Fighter */}
                <div className="flex-1 flex flex-col items-center">
                  <img
                    src={fight.fighters.first.logo}
                    alt={fight.fighters.first.name}
                    className="w-14 h-14 object-contain mb-2"
                  />
                  <p
                    className={`text-sm font-semibold ${
                      fight.fighters.first.winner ? "text-green-400" : "text-gray-300"
                    }`}
                  >
                    {fight.fighters.first.name}
                  </p>
                </div>

                {/* VS */}
                <div className="text-gray-400 font-bold">VS</div>

                {/* Second Fighter */}
                <div className="flex-1 flex flex-col items-center">
                  <img
                    src={fight.fighters.second.logo}
                    alt={fight.fighters.second.name}
                    className="w-14 h-14 object-contain mb-2"
                  />
                  <p
                    className={`text-sm font-semibold ${
                      fight.fighters.second.winner ? "text-green-400" : "text-gray-300"
                    }`}
                  >
                    {fight.fighters.second.name}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 text-center">
                <span className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                  {fight.status.long}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No matches available</p>
        )}
      </div>)
}
