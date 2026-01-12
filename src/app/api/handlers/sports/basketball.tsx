import MatchCard from '@/components/MatchCard';
import { sortByLiveStatus } from '@/lib/liveStatus';

export default async function BasketballMatchesHandler() {
    const todayDate = new Date().toISOString().split("T")[0];

    const response = await fetch(`https://v1.basketball.api-sports.io/games?date=${todayDate}`, {
        method: 'GET',
        headers: {
            "x-rapidapi-host": "v1.basketball.api-sports.io",
            "x-rapidapi-key": "115c63a79ada64779433b7f133255804"
        },
        next: {
            revalidate: 30
        }
    });

    const data = await response.json();
    const matchData = (Array.isArray(data.response) ? data.response : []);
    const sortedMatches = sortByLiveStatus(matchData, (match: any) => match?.status);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
                {sortedMatches.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <div className="text-gray-400 text-lg font-medium">No live matches available</div>
                        <p className="text-gray-500 text-sm mt-2">Check back later for upcoming games</p>
                    </div>
                )}
                {sortedMatches.map((match:any) => (
                    <MatchCard
                        key={match.id}
                        matchId={match.id}
                        league={{
                            name: match.league?.name || 'Basketball League',
                            emoji: "🏀",
                        }}
                        homeTeam={{
                            name: match.teams?.home?.name || 'Home Team',
                            logo: match.teams?.home?.logo || "/api/placeholder",
                            goals: match.scores?.home?.total ?? 0,
                        }}
                        awayTeam={{
                            name: match.teams?.away?.name || 'Away Team',
                            logo: match.teams?.away?.logo || "/api/placeholder",
                            goals: match.scores?.away?.total ?? 0,
                        }}
                        status={{
                            long: typeof match.status?.long === 'string' ? match.status.long : 'Scheduled',
                            short: typeof match.status?.short === 'string' ? match.status.short : undefined,
                        }}
                        href={`../match/bb${match.id}`}
                    />
                ))}
            </div>
        </div>
    );
}


export async function BasketballMatchByIdHandler({ id }: { id: string }) {
    const response = await fetch(`https://v1.basketball.api-sports.io/games?id=${id}`, {
        method: 'GET',
        headers: {
            "x-rapidapi-host": "v1.basketball.api-sports.io",
            "x-rapidapi-key": "115c63a79ada64779433b7f133255804"
        },
        next: {
            revalidate: 30
        }
    });

    // Fetch game statistics
    const statsResponse = await fetch(`https://v1.basketball.api-sports.io/statistics?game=${id}`, {
        method: 'GET',
        headers: {
            "x-rapidapi-host": "v1.basketball.api-sports.io",
            "x-rapidapi-key": "115c63a79ada64779433b7f133255804"
        },
        next: {
            revalidate: 30
        }
    });
    
    const data = await response.json();
    const matchData = Array.isArray(data.response) ? data.response : [];

    let statistics: any[] = [];
    try {
        const statsData = await statsResponse.json();
        statistics = Array.isArray(statsData.response) ? statsData.response : [];
    } catch (e) {
        // Statistics may not be available
    }

    if (matchData.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="text-gray-400 text-lg font-medium">Match not found</div>
                <p className="text-gray-500 text-sm mt-2">Unable to load match data</p>
            </div>
        );
    }

    const match = matchData[0];
    const homeStats = statistics.find((s: any) => s.team?.id === match.teams?.home?.id);
    const awayStats = statistics.find((s: any) => s.team?.id === match.teams?.away?.id);

    return (
        <div className="bg-[#1a1a1a] w-full border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Header with League and Status */}
            <div className="flex items-center justify-between mb-6">
                {/* League Info */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-900/20 border border-orange-400/30 rounded-full">
                    <span className="text-2xl">🏀</span>
                    <span className="text-orange-400 font-bold text-lg">
                        {match.league?.name || 'Basketball League'}
                    </span>
                    {match.league?.season && (
                        <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-300 font-medium">Season {match.league.season}</span>
                        </>
                    )}
                </div>

                {/* Status and Time */}
                <div className="flex items-center gap-4">
                    {match.date && (
                        <div className="text-right">
                            <div className="text-gray-400 text-xs">
                                {new Date(match.date).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                })}
                            </div>
                            <div className="text-white font-semibold text-sm">
                                {match.time || 'TBA'}
                            </div>
                        </div>
                    )}
                    <div className="bg-black/30 rounded-xl px-4 py-2 border border-white/5">
                        <div className="text-orange-400 font-bold text-sm">
                            {match.status?.long === "Game Finished" ? "Final" : match.status?.long || "Live"}
                        </div>
                        {match.status?.timer && (
                            <div className="text-gray-400 text-xs text-center">{match.status.timer}'</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Venue Information */}
            <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/5 text-center">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🏟️</span>
                        <span className="text-white font-semibold">{match.league?.name || 'Basketball'}</span>
                    </div>
                    {match.country?.name && (
                        <>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">{match.country.name}</span>
                        </>
                    )}
                    {match.country?.flag && (
                        <img src={match.country.flag} alt={match.country.name} className="w-6 h-4 object-cover rounded" />
                    )}
                </div>
            </div>

            {/* Teams & Main Score */}
            <div className="mb-8">
                <div className="flex items-center justify-between gap-8">
                    {/* Home Team */}
                    <div className="flex-1 text-center">
                        <div className="mb-4">
                            {match.teams?.home?.logo && (
                                <img
                                    src={match.teams.home.logo}
                                    alt={match.teams.home.name}
                                    className="w-32 h-32 mx-auto object-contain"
                                />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {match.teams?.home?.name || 'Home Team'}
                        </h2>
                        <div className="text-6xl font-black text-orange-400">
                            {match.scores?.home?.total ?? 0}
                        </div>
                    </div>

                    {/* VS Divider */}
                    <div className="flex flex-col items-center">
                        <div className="text-gray-500 font-bold text-2xl">VS</div>
                        <div className="h-24 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent my-4"></div>
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-center">
                        <div className="mb-4">
                            {match.teams?.away?.logo && (
                                <img
                                    src={match.teams.away.logo}
                                    alt={match.teams.away.name}
                                    className="w-32 h-32 mx-auto object-contain"
                                />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {match.teams?.away?.name || 'Away Team'}
                        </h2>
                        <div className="text-6xl font-black text-orange-400">
                            {match.scores?.away?.total ?? 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quarter by Quarter Scores */}
            <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 text-center">Score Breakdown</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-center">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Team</th>
                                <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Q1</th>
                                <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Q2</th>
                                <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Q3</th>
                                <th className="py-3 px-4 text-gray-400 font-semibold text-sm">Q4</th>
                                {(match.scores?.home?.over_time || match.scores?.away?.over_time) && (
                                    <th className="py-3 px-4 text-gray-400 font-semibold text-sm">OT</th>
                                )}
                                <th className="py-3 px-4 text-orange-400 font-bold text-sm">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Home Team Row */}
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4 text-white font-semibold">
                                    {match.teams?.home?.name || 'Home'}
                                </td>
                                <td className="py-4 px-4 text-gray-300">
                                    {match.scores?.home?.quarter_1 ?? 0}
                                </td>
                                <td className="py-4 px-4 text-gray-300">
                                    {match.scores?.home?.quarter_2 ?? 0}
                                </td>
                                <td className="py-4 px-4 text-gray-300">
                                    {match.scores?.home?.quarter_3 ?? 0}
                                </td>
                                <td className="py-4 px-4 text-gray-300">
                                    {match.scores?.home?.quarter_4 ?? 0}
                                </td>
                                {(match.scores?.home?.over_time || match.scores?.away?.over_time) && (
                                    <td className="py-4 px-4 text-gray-300">
                                        {match.scores?.home?.over_time ?? 0}
                                    </td>
                                )}
                                <td className="py-4 px-4 text-orange-400 font-bold text-xl">
                                    {match.scores?.home?.total ?? 0}
                                </td>
                            </tr>
                            {/* Away Team Row */}
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4 text-white font-semibold">
                                    {match.teams?.away?.name || 'Away'}
                                </td>
                                <td className="py-4 px-4 text-gray-300">
                                    {match.scores?.away?.quarter_1 ?? 0}
                                </td>
                                <td className="py-4 px-4 text-gray-300">
                                    {match.scores?.away?.quarter_2 ?? 0}
                                </td>
                                <td className="py-4 px-4 text-gray-300">
                                    {match.scores?.away?.quarter_3 ?? 0}
                                </td>
                                <td className="py-4 px-4 text-gray-300">
                                    {match.scores?.away?.quarter_4 ?? 0}
                                </td>
                                {(match.scores?.home?.over_time || match.scores?.away?.over_time) && (
                                    <td className="py-4 px-4 text-gray-300">
                                        {match.scores?.away?.over_time ?? 0}
                                    </td>
                                )}
                                <td className="py-4 px-4 text-orange-400 font-bold text-xl">
                                    {match.scores?.away?.total ?? 0}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Game Status */}
            <div className="text-center mb-6">
                <span className="inline-flex items-center px-6 py-3 rounded-full text-base font-bold bg-orange-900/30 text-orange-400 border-2 border-orange-400/30">
                    {match.status?.long === "Game Finished" ? "🏁 Final" : match.status?.long || match.status?.short || "Live"}
                </span>
            </div>

            {/* Team Statistics */}
            {(homeStats || awayStats) && (
                <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4 text-center">Team Statistics</h3>
                    <div className="space-y-4">
                        {/* Field Goals */}
                        {(homeStats?.statistics?.fieldGoalsMade !== undefined || awayStats?.statistics?.fieldGoalsMade !== undefined) && (
                            <div className="flex items-center justify-between">
                                <div className="flex-1 text-right pr-4">
                                    <span className="text-white font-bold">
                                        {homeStats?.statistics?.fieldGoalsMade ?? 0}/{homeStats?.statistics?.fieldGoalsAttempted ?? 0}
                                    </span>
                                </div>
                                <div className="text-gray-400 text-sm text-center min-w-[120px]">Field Goals</div>
                                <div className="flex-1 text-left pl-4">
                                    <span className="text-white font-bold">
                                        {awayStats?.statistics?.fieldGoalsMade ?? 0}/{awayStats?.statistics?.fieldGoalsAttempted ?? 0}
                                    </span>
                                </div>
                            </div>
                        )}
                        {/* 3-Pointers */}
                        {(homeStats?.statistics?.threePointsMade !== undefined || awayStats?.statistics?.threePointsMade !== undefined) && (
                            <div className="flex items-center justify-between">
                                <div className="flex-1 text-right pr-4">
                                    <span className="text-white font-bold">
                                        {homeStats?.statistics?.threePointsMade ?? 0}/{homeStats?.statistics?.threePointsAttempted ?? 0}
                                    </span>
                                </div>
                                <div className="text-gray-400 text-sm text-center min-w-[120px]">3-Pointers</div>
                                <div className="flex-1 text-left pl-4">
                                    <span className="text-white font-bold">
                                        {awayStats?.statistics?.threePointsMade ?? 0}/{awayStats?.statistics?.threePointsAttempted ?? 0}
                                    </span>
                                </div>
                            </div>
                        )}
                        {/* Free Throws */}
                        {(homeStats?.statistics?.freeThrowsMade !== undefined || awayStats?.statistics?.freeThrowsMade !== undefined) && (
                            <div className="flex items-center justify-between">
                                <div className="flex-1 text-right pr-4">
                                    <span className="text-white font-bold">
                                        {homeStats?.statistics?.freeThrowsMade ?? 0}/{homeStats?.statistics?.freeThrowsAttempted ?? 0}
                                    </span>
                                </div>
                                <div className="text-gray-400 text-sm text-center min-w-[120px]">Free Throws</div>
                                <div className="flex-1 text-left pl-4">
                                    <span className="text-white font-bold">
                                        {awayStats?.statistics?.freeThrowsMade ?? 0}/{awayStats?.statistics?.freeThrowsAttempted ?? 0}
                                    </span>
                                </div>
                            </div>
                        )}
                        {/* Rebounds */}
                        {(homeStats?.statistics?.reboundsTotal !== undefined || awayStats?.statistics?.reboundsTotal !== undefined) && (
                            <div className="flex items-center justify-between">
                                <div className="flex-1 text-right pr-4">
                                    <span className={`font-bold ${
                                        (homeStats?.statistics?.reboundsTotal ?? 0) > (awayStats?.statistics?.reboundsTotal ?? 0) ? 'text-orange-400' : 'text-white'
                                    }`}>
                                        {homeStats?.statistics?.reboundsTotal ?? 0}
                                    </span>
                                </div>
                                <div className="text-gray-400 text-sm text-center min-w-[120px]">Total Rebounds</div>
                                <div className="flex-1 text-left pl-4">
                                    <span className={`font-bold ${
                                        (awayStats?.statistics?.reboundsTotal ?? 0) > (homeStats?.statistics?.reboundsTotal ?? 0) ? 'text-orange-400' : 'text-white'
                                    }`}>
                                        {awayStats?.statistics?.reboundsTotal ?? 0}
                                    </span>
                                </div>
                            </div>
                        )}
                        {/* Assists */}
                        {(homeStats?.statistics?.assists !== undefined || awayStats?.statistics?.assists !== undefined) && (
                            <div className="flex items-center justify-between">
                                <div className="flex-1 text-right pr-4">
                                    <span className={`font-bold ${
                                        (homeStats?.statistics?.assists ?? 0) > (awayStats?.statistics?.assists ?? 0) ? 'text-orange-400' : 'text-white'
                                    }`}>
                                        {homeStats?.statistics?.assists ?? 0}
                                    </span>
                                </div>
                                <div className="text-gray-400 text-sm text-center min-w-[120px]">Assists</div>
                                <div className="flex-1 text-left pl-4">
                                    <span className={`font-bold ${
                                        (awayStats?.statistics?.assists ?? 0) > (homeStats?.statistics?.assists ?? 0) ? 'text-orange-400' : 'text-white'
                                    }`}>
                                        {awayStats?.statistics?.assists ?? 0}
                                    </span>
                                </div>
                            </div>
                        )}
                        {/* Steals */}
                        {(homeStats?.statistics?.steals !== undefined || awayStats?.statistics?.steals !== undefined) && (
                            <div className="flex items-center justify-between">
                                <div className="flex-1 text-right pr-4">
                                    <span className={`font-bold ${
                                        (homeStats?.statistics?.steals ?? 0) > (awayStats?.statistics?.steals ?? 0) ? 'text-orange-400' : 'text-white'
                                    }`}>
                                        {homeStats?.statistics?.steals ?? 0}
                                    </span>
                                </div>
                                <div className="text-gray-400 text-sm text-center min-w-[120px]">Steals</div>
                                <div className="flex-1 text-left pl-4">
                                    <span className={`font-bold ${
                                        (awayStats?.statistics?.steals ?? 0) > (homeStats?.statistics?.steals ?? 0) ? 'text-orange-400' : 'text-white'
                                    }`}>
                                        {awayStats?.statistics?.steals ?? 0}
                                    </span>
                                </div>
                            </div>
                        )}
                        {/* Blocks */}
                        {(homeStats?.statistics?.blocks !== undefined || awayStats?.statistics?.blocks !== undefined) && (
                            <div className="flex items-center justify-between">
                                <div className="flex-1 text-right pr-4">
                                    <span className={`font-bold ${
                                        (homeStats?.statistics?.blocks ?? 0) > (awayStats?.statistics?.blocks ?? 0) ? 'text-orange-400' : 'text-white'
                                    }`}>
                                        {homeStats?.statistics?.blocks ?? 0}
                                    </span>
                                </div>
                                <div className="text-gray-400 text-sm text-center min-w-[120px]">Blocks</div>
                                <div className="flex-1 text-left pl-4">
                                    <span className={`font-bold ${
                                        (awayStats?.statistics?.blocks ?? 0) > (homeStats?.statistics?.blocks ?? 0) ? 'text-orange-400' : 'text-white'
                                    }`}>
                                        {awayStats?.statistics?.blocks ?? 0}
                                    </span>
                                </div>
                            </div>
                        )}
                        {/* Turnovers */}
                        {(homeStats?.statistics?.turnovers !== undefined || awayStats?.statistics?.turnovers !== undefined) && (
                            <div className="flex items-center justify-between">
                                <div className="flex-1 text-right pr-4">
                                    <span className={`font-bold ${
                                        (homeStats?.statistics?.turnovers ?? 0) < (awayStats?.statistics?.turnovers ?? 0) ? 'text-orange-400' : 'text-white'
                                    }`}>
                                        {homeStats?.statistics?.turnovers ?? 0}
                                    </span>
                                </div>
                                <div className="text-gray-400 text-sm text-center min-w-[120px]">Turnovers</div>
                                <div className="flex-1 text-left pl-4">
                                    <span className={`font-bold ${
                                        (awayStats?.statistics?.turnovers ?? 0) < (homeStats?.statistics?.turnovers ?? 0) ? 'text-orange-400' : 'text-white'
                                    }`}>
                                        {awayStats?.statistics?.turnovers ?? 0}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Match Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* League Info */}
                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🏆</span>
                        <div>
                            <div className="text-gray-400 text-xs uppercase font-semibold mb-1">League</div>
                            <div className="text-white font-medium">
                                {match.league?.name || 'Basketball League'}
                            </div>
                            {match.league?.type && (
                                <div className="text-gray-400 text-sm">{match.league.type}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Country */}
                {match.country?.name && (
                    <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                        <div className="flex items-center gap-3">
                            {match.country?.flag ? (
                                <img src={match.country.flag} alt={match.country.name} className="w-10 h-7 object-cover rounded" />
                            ) : (
                                <span className="text-3xl">🌍</span>
                            )}
                            <div>
                                <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Country</div>
                                <div className="text-white font-medium">{match.country.name}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Season */}
                {match.league?.season && (
                    <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">📅</span>
                            <div>
                                <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Season</div>
                                <div className="text-white font-medium">{match.league.season}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Week/Stage */}
                {match.week && (
                    <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">📊</span>
                            <div>
                                <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Week</div>
                                <div className="text-white font-medium">Week {match.week}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
