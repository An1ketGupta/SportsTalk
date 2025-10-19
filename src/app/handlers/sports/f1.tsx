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

    return (<main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchData.length === 0 ? (
          <p>Loading F1 races...</p>
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
                className="border rounded-lg shadow p-4 flex flex-col gap-2 bg-gray-900"
              >
                {/* Race Name */}
                <p className="text-sm text-gray-400 font-medium">{race.competition.name}</p>

                {/* Circuit */}
                <div className="flex items-center gap-2">
                  {race.circuit.image && (
                    <img src={race.circuit.image} alt={race.circuit.name} className="w-10 h-10 object-contain" />
                  )}
                  <span className="font-semibold">{race.circuit.name}</span>
                </div>

                {/* Laps & Distance */}
                <p className="text-sm text-gray-500">
                  🏁 Laps: {race.laps.total} | Distance: {race.distance}
                </p>

                {/* Date & Time */}
                <p className="text-sm text-gray-500">
                  🗓 {formattedDate} – {formattedTime} (UTC)
                </p>

                {/* Status */}
                <p className="text-xs text-blue-400">Status: {race.status}</p>

                {/* Location */}
                <p className="text-sm text-gray-500">
                  📍 {race.competition.location.city}, {race.competition.location.country}
                </p>
              </div>
            );
          })
        )}
      </main>)

}