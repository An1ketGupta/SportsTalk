import axios from 'axios';
export default async function F1MatchesHandler() {
    const todayDate = new Date().toISOString().split("T")[0]
    const response = await axios.get('https://v1.formula-1.api-sports.io/races', {
        params: {
            date: todayDate
        },
        headers: {
            'x-rapidapi-host': 'v1.formula-1.api-sports.io',
            'x-rapidapi-key': '115c63a79ada64779433b7f133255804'
        }
    })

    const data = await response.data.response
    const matchData = (Array.isArray(data) ? data : []);

    return (<main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {matchData.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-gray-400 text-lg font-medium">Loading F1 races...</div>
            <p className="text-gray-500 text-sm mt-2">Fetching race schedules and standings</p>
          </div>
        ) : (
          matchData.map((race: any) => {
            const date = new Date(race.date);
            const formattedDate = date.toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            const formattedTime = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={race.id}
                className="group bg-[#181818] hover:bg-[#1f1f1f] border border-white/5 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col"
              >
                {/* Race Header */}
                <div className="text-center mb-4">
                  <div className="text-sm font-medium text-red-400 mb-1">
                    🏎️ {race.competition.name || 'F1 Race'}
                  </div>
                </div>

                {/* Circuit Info */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  {race.circuit.image && (
                    <img 
                      src={race.circuit.image} 
                      alt={race.circuit.name} 
                      className="w-12 h-12 object-contain" 
                    />
                  )}
                  <div className="text-center">
                    <span className="font-semibold text-white text-sm">{race.circuit.name}</span>
                  </div>
                </div>

                {/* Race Details */}
                <div className="space-y-3 mb-4">
                  {/* Laps & Distance */}
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">🏁 Laps:</span>
                      <span className="text-white font-semibold">{race.laps.total}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-300">Distance:</span>
                      <span className="text-white font-semibold">{race.distance}</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>📍</span>
                    <span>{race.competition.location.city}, {race.competition.location.country}</span>
                  </div>

                  {/* Date & Time */}
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>🗓</span>
                    <span>{formattedDate} – {formattedTime} (UTC)</span>
                  </div>
                </div>

                {/* Status */}
                <div className="text-center mt-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-400/20">
                    {race.status || 'Scheduled'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </main>)

}