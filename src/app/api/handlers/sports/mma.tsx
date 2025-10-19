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

    return (<div className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {matchData.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-gray-400 text-lg font-medium">Loading MMA fights...</div>
            <p className="text-gray-500 text-sm mt-2">Fetching live fight cards and match data</p>
          </div>
        ) : (
          matchData.map((fight: any) => (
            <a
              href={`../match/mm${fight.id}`}
              key={fight.id}
              className="group bg-[#181818] hover:bg-[#1f1f1f] border border-white/5 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col"
            >
              {/* Event Info */}
              <div className="text-center mb-4">
                <div className="text-sm font-medium text-purple-400 mb-1">
                  🥊 {fight.slug || 'MMA Fight'}
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(fight.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })} • {fight.category}
                </p>
              </div>

              {/* Fighters */}
              <div className="flex items-center justify-between gap-3 mb-4">
                {/* First Fighter */}
                <div className="flex-1 flex flex-col items-center">
                  <img
                    src={fight.fighters.first.logo}
                    alt={fight.fighters.first.name}
                    className="w-16 h-16 object-contain mb-2 rounded-full border-2 border-gray-700"
                  />
                  <p
                    className={`text-sm font-semibold text-center ${
                      fight.fighters.first.winner ? "text-green-400" : "text-white"
                    }`}
                  >
                    {fight.fighters.first.name}
                  </p>
                  {fight.fighters.first.winner && (
                    <span className="text-xs text-green-400 font-medium">WINNER</span>
                  )}
                </div>

                {/* VS */}
                <div className="text-gray-400 font-bold text-lg">VS</div>

                {/* Second Fighter */}
                <div className="flex-1 flex flex-col items-center">
                  <img
                    src={fight.fighters.second.logo}
                    alt={fight.fighters.second.name}
                    className="w-16 h-16 object-contain mb-2 rounded-full border-2 border-gray-700"
                  />
                  <p
                    className={`text-sm font-semibold text-center ${
                      fight.fighters.second.winner ? "text-green-400" : "text-white"
                    }`}
                  >
                    {fight.fighters.second.name}
                  </p>
                  {fight.fighters.second.winner && (
                    <span className="text-xs text-green-400 font-medium">WINNER</span>
                  )}
                </div>
              </div>

              {/* Fight Details */}
              <div className="space-y-2 text-xs text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <span>🗓</span>
                  <span>{new Date(fight.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>

              {/* Status */}
              <div className="text-center mt-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-400/20">
                  {fight.status.long || 'Scheduled'}
                </span>
              </div>
            </a>
          ))
        )}
      </div>)
}
