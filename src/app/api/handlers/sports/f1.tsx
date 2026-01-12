import MatchCard from '@/components/MatchCard';
import { sortByLiveStatus } from '@/lib/liveStatus';

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
    const sortedRaces = sortByLiveStatus(matchData, (race: any) => race?.status);

                return (
                        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
                <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
                                {sortedRaces.length === 0 ? (
                                    <div className="col-span-full text-center py-20">
                                        <div className="text-gray-400 text-lg font-medium">No upcoming F1 races</div>
                                        <p className="text-gray-500 text-sm mt-2">No upcoming or live F1 races right now</p>
                                    </div>
                        ) : (
                            sortedRaces.map((race: any) => {
                                return (
                                    <MatchCard
                                        key={race.id}
                                        matchId={race.id}
                                        league={{
                                            name: race.competition.name || 'F1 Race',
                                            emoji: "🏎️",
                                        }}
                                        homeTeam={{
                                            name: race.circuit.name,
                                            logo: race.circuit.image || "/api/placeholder",
                                            goals: race.laps.total ?? 0,
                                        }}
                                        awayTeam={{
                                            name: race.distance || "N/A",
                                            logo: race.circuit.image || "/api/placeholder",
                                            goals: 0,
                                        }}
                                        status={{
                                            long: typeof race.status === 'string' ? race.status : 'Scheduled',
                                            short: typeof race.status === 'string' ? race.status : undefined,
                                        }}
                                        href={`../match/f1${race.id}`}
                                    />
                                );
                            })
                        )}
                    </div>
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

  const isRaceLive = race.status?.toLowerCase().includes('live') || 
                     race.status?.toLowerCase().includes('running') ||
                     (race.laps?.current > 0 && race.laps?.current < race.laps?.total);
  const isRaceFinished = race.status?.toLowerCase().includes('completed') || 
                         race.status?.toLowerCase().includes('finished');

  return (
    <div className="w-full space-y-4 p-4 md:p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🏎️</span>
          <div>
            <h1 className="text-white font-semibold text-lg">{race.competition?.name || 'Formula 1'}</h1>
            <p className="text-gray-500 text-sm">{race.type}</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
          isRaceLive 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : isRaceFinished 
              ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' 
              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        }`}>
          {isRaceLive && <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse" />}
          {isRaceFinished ? "Finished" : isRaceLive ? `Lap ${race.laps?.current}/${race.laps?.total}` : "Scheduled"}
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-gray-400 text-sm flex-wrap">
        <span>📍</span>
        <span>{race.competition?.location?.city}, {race.competition?.location?.country}</span>
        {race.date && (
          <>
            <span className="text-gray-600">•</span>
            <span>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </>
        )}
      </div>

      {/* Circuit Card */}
      <div className="bg-[#111] rounded-2xl p-6 md:p-8 border border-white/5">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {race.circuit?.image && (
            <img 
              src={race.circuit.image} 
              alt={race.circuit?.name} 
              className="w-32 h-32 md:w-40 md:h-40 object-contain" 
            />
          )}
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{race.circuit?.name}</h2>
            <p className="text-gray-400 text-sm mb-4">
              {race.competition?.location?.city}, {race.competition?.location?.country}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white tabular-nums">{race.laps?.total || 0}</div>
                <div className="text-gray-500 text-xs">Total Laps</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white tabular-nums">{race.distance || '-'}</div>
                <div className="text-gray-500 text-xs">Distance</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Race Progress */}
      {(race.laps?.current > 0 || isRaceFinished) && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-white text-sm font-medium">Race Progress</h3>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Lap Progress</span>
              <span className="text-white tabular-nums">{race.laps?.current || race.laps?.total} / {race.laps?.total}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${((race.laps?.current || (isRaceFinished ? race.laps?.total : 0)) / (race.laps?.total || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Weather */}
      {race.weather && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-white text-sm font-medium">Weather Conditions</h3>
          </div>
          
          <div className="grid grid-cols-3 divide-x divide-white/5">
            {race.weather.temp && (
              <div className="p-4 text-center">
                <div className="text-gray-500 text-xs mb-1">Temperature</div>
                <div className="text-white font-semibold">{race.weather.temp}</div>
              </div>
            )}
            {race.weather.humidity && (
              <div className="p-4 text-center">
                <div className="text-gray-500 text-xs mb-1">Humidity</div>
                <div className="text-white font-semibold">{race.weather.humidity}</div>
              </div>
            )}
            {race.weather.wind && (
              <div className="p-4 text-center">
                <div className="text-gray-500 text-xs mb-1">Wind</div>
                <div className="text-white font-semibold">{race.weather.wind}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fastest Lap */}
      {race.fastest_lap && (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <span>⚡</span>
            <h3 className="text-white text-sm font-medium">Fastest Lap</h3>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                {race.fastest_lap.driver && (
                  <div className="text-white font-medium">{race.fastest_lap.driver.name}</div>
                )}
                {race.fastest_lap.team && (
                  <div className="text-gray-500 text-sm">{race.fastest_lap.team.name}</div>
                )}
              </div>
              {race.fastest_lap.time && (
                <div className="text-2xl font-bold text-white tabular-nums">{race.fastest_lap.time}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Race Info */}
      <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <h3 className="text-white text-sm font-medium">Race Details</h3>
        </div>
        
        <div className="grid grid-cols-2 divide-x divide-white/5">
          <div className="p-4">
            <div className="text-gray-500 text-xs mb-1">Circuit</div>
            <div className="text-white text-sm">{race.circuit?.name}</div>
          </div>
          <div className="p-4">
            <div className="text-gray-500 text-xs mb-1">Date & Time</div>
            <div className="text-white text-sm">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>
        </div>
      </div>

    </div>
  );
}