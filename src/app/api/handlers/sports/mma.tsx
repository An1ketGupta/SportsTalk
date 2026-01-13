import MatchCard from '@/components/MatchCard';
import { sortByLiveStatus } from '@/lib/liveStatus';
import { fetchSportsData } from "@/app/actions/sports";

export default async function MMAMatchesHandler() {
  const todaydate = new Date().toISOString().split("T")[0]
  const url = `https://v1.mma.api-sports.io/fights?date=${todaydate}`;
  const json = await fetchSportsData(url, "v1.mma.api-sports.io");

  const data = json ? json.response : []
  const matchData = Array.isArray(data) ? data : []
  const sortedFights = sortByLiveStatus(matchData, (fight: any) => fight?.status)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {sortedFights.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-gray-400 text-lg font-medium">No live fights available</div>
          </div>
        ) : (
          sortedFights.map((fight: any) => (
            <MatchCard
              key={fight.id}
              matchId={fight.id}
              league={{
                name: fight.slug || "MMA Fight",
                emoji: "🥊",
              }}
              homeTeam={{
                name: fight.fighters.first.name,
                logo: fight.fighters.first.logo || "/api/placeholder",
                goals: fight.fighters.first.winner ? 1 : 0,
              }}
              awayTeam={{
                name: fight.fighters.second.name,
                logo: fight.fighters.second.logo || "/api/placeholder",
                goals: fight.fighters.second.winner ? 1 : 0,
              }}
              status={{
                long: typeof fight.status === 'string' ? fight.status : fight.category || 'Scheduled',
                short: typeof fight.status === 'string' ? fight.status : undefined,
              }}
              href={`../match/mm${fight.id}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

