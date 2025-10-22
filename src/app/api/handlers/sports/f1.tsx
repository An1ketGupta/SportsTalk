export default async function F1MatchesHandler() {
    const todayDate = new Date().toISOString().split("T")[0];

    const response = await fetch(
        `https://v1.formula-1.api-sports.io/races?date=${todayDate}`,
        {
            method: "GET",
            headers: {
                "x-rapidapi-host": "v1.formula-1.api-sports.io",
                "x-rapidapi-key": "115c63a79ada64779433b7f133255804"
            },
            next: { revalidate: 30 } // cache for 30 seconds
        }
    );

    const json = await response.json();
    const data = json.response;
    const matchData = (Array.isArray(data) ? data : []);

    return (
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <a
                href={`../match/f1${race.id}`}
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
              </a>
            );
          })
        )}
      </main>
    );
}


export async function F1MatchByIdHandler({ id }: { id: string }) {
  const response = await fetch(
      `https://v1.formula-1.api-sports.io/races?id=${id}`,
      {
          method: "GET",
          headers: {
              "x-rapidapi-host": "v1.formula-1.api-sports.io",
              "x-rapidapi-key": "115c63a79ada64779433b7f133255804"
          },
          next: { revalidate: 30 }
      }
  );

  const json = await response.json();
  const matchData = Array.isArray(json.response) ? json.response : [];

  if (matchData.length === 0) {
      return (
          <div className="text-center py-20">
              <div className="text-gray-400 text-lg font-medium">Race not found</div>
              <p className="text-gray-500 text-sm mt-2">Unable to load race data</p>
          </div>
      );
  }

  const race = matchData[0];
  const date = new Date(race.date);
  const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
  });

  return (
      <div className="bg-[#1a1a1a] w-full border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Race Header */}
          <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-400/30 rounded-full">
                  <span className="text-2xl">🏎️</span>
                  <span className="text-red-400 font-bold text-lg">
                      {race.competition.name || 'Formula 1'}
                  </span>
              </div>
              <div className="mt-3">
                  <h1 className="text-3xl font-black text-white mb-2">{race.type}</h1>
                  <p className="text-gray-400 text-sm">
                      {race.competition.location.city}, {race.competition.location.country}
                  </p>
              </div>
          </div>

          {/* Circuit Info */}
          <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
              <div className="flex items-center justify-center gap-6">
                  {race.circuit.image && (
                      <img 
                          src={race.circuit.image} 
                          alt={race.circuit.name} 
                          className="w-32 h-32 object-contain" 
                      />
                  )}
                  <div>
                      <h2 className="text-2xl font-bold text-white mb-1">{race.circuit.name}</h2>
                      <p className="text-gray-400 text-sm">
                          {race.competition.location.city}, {race.competition.location.country}
                      </p>
                  </div>
              </div>
          </div>

          {/* Race Stats */}
          <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 text-center">Race Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                      <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Total Laps</div>
                      <div className="text-white font-bold text-2xl">{race.laps.total}</div>
                  </div>
                  <div>
                      <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Current Lap</div>
                      <div className="text-white font-bold text-2xl">{race.laps.current || 0}</div>
                  </div>
                  <div>
                      <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Distance</div>
                      <div className="text-white font-bold text-2xl">{race.distance}</div>
                  </div>
              </div>
          </div>

          {/* Weather Conditions (if available) */}
          {race.weather && (
              <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4 text-center">Weather Conditions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      {race.weather.temp && (
                          <div>
                              <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Temperature</div>
                              <div className="text-white font-bold text-xl">{race.weather.temp}</div>
                          </div>
                      )}
                      {race.weather.humidity && (
                          <div>
                              <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Humidity</div>
                              <div className="text-white font-bold text-xl">{race.weather.humidity}</div>
                          </div>
                      )}
                      {race.weather.wind && (
                          <div>
                              <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Wind</div>
                              <div className="text-white font-bold text-xl">{race.weather.wind}</div>
                          </div>
                      )}
                  </div>
              </div>
          )}

          {/* Fastest Lap (if available) */}
          {race.fastest_lap && (
              <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4 text-center">⚡ Fastest Lap</h3>
                  <div className="text-center">
                      {race.fastest_lap.driver && (
                          <div className="text-xl font-bold text-red-400 mb-2">
                              {race.fastest_lap.driver.name}
                          </div>
                      )}
                      {race.fastest_lap.time && (
                          <div className="text-3xl font-black text-white">{race.fastest_lap.time}</div>
                      )}
                  </div>
              </div>
          )}

          {/* Race Status */}
          <div className="text-center mb-6">
              <span className="inline-flex items-center px-6 py-3 rounded-full text-base font-bold bg-red-900/30 text-red-400 border-2 border-red-400/30">
                  {race.status === "Completed" ? "🏁 Race Finished" : race.status || "Scheduled"}
              </span>
          </div>

          {/* Race Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Circuit Details */}
              <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                  <div className="flex items-center gap-3">
                      <span className="text-3xl">🏁</span>
                      <div>
                          <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Circuit</div>
                          <div className="text-white font-medium">{race.circuit.name}</div>
                          <div className="text-gray-400 text-sm">
                              {race.competition.location.city}, {race.competition.location.country}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Date & Time */}
              <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                  <div className="flex items-center gap-3">
                      <span className="text-3xl">📅</span>
                      <div>
                          <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Date & Time</div>
                          <div className="text-white font-medium">{formattedDate}</div>
                          <div className="text-gray-400 text-sm">{formattedTime} (UTC)</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
}