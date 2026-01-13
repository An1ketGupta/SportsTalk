import MatchCard from '@/components/MatchCard';
import { sortByLiveStatus } from '@/lib/liveStatus';
import { fetchSportsData } from "@/app/actions/sports";

export default async function BasketballMatchesHandler() {
    const todayDate = new Date().toISOString().split("T")[0];
    const url = `https://v1.basketball.api-sports.io/games?date=${todayDate}`;
    const json = await fetchSportsData(url, "v1.basketball.api-sports.io");

    const data = json || {};
    const matchData = (Array.isArray(data.response) ? data.response : []);
    const sortedMatches = sortByLiveStatus(matchData, (match: any) => match?.status);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
                {sortedMatches.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <div className="text-gray-400 text-lg font-medium">No live matches available</div>
                    </div>
                )}
                {sortedMatches.map((match: any) => (
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
    const url = `https://v1.basketball.api-sports.io/games?id=${id}`;
    const json = await fetchSportsData(url, "v1.basketball.api-sports.io");

    // Fetch game statistics
    const statsUrl = `https://v1.basketball.api-sports.io/statistics?game=${id}`;
    const statsJson = await fetchSportsData(statsUrl, "v1.basketball.api-sports.io");

    const data = json || {};
    const matchData = Array.isArray(data.response) ? data.response : [];

    let statistics: any[] = [];
    try {
        const statsData = statsJson || {};
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

    const isGameLive = match.status?.short && !["FT", "NS", "AOT", "POST"].includes(match.status.short);
    const isGameFinished = match.status?.long === "Game Finished" || match.status?.short === "FT" || match.status?.short === "AOT";

    return (
        <div className="w-full space-y-4 p-4 md:p-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-xl">🏀</span>
                    <div>
                        <h1 className="text-white font-semibold text-lg">{match.league?.name || 'Basketball'}</h1>
                        <p className="text-gray-500 text-sm">{match.league?.season ? `Season ${match.league.season}` : match.country?.name}</p>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isGameLive
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : isGameFinished
                            ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                    {isGameLive && <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse" />}
                    {isGameFinished ? "Final" : isGameLive ? match.status?.long : "Scheduled"}
                </div>
            </div>

            {/* Venue */}
            <div className="flex items-center gap-2 text-gray-400 text-sm flex-wrap">
                {match.country?.name && (
                    <>
                        <span>📍</span>
                        <span>{match.country.name}</span>
                    </>
                )}
                {match.date && (
                    <>
                        {match.country?.name && <span className="text-gray-600">•</span>}
                        <span>{new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </>
                )}
                {match.time && (
                    <>
                        <span className="text-gray-600">•</span>
                        <span>{match.time}</span>
                    </>
                )}
            </div>

            {/* Main Scoreboard */}
            <div className="bg-[#111] rounded-2xl p-6 md:p-8 border border-white/5">
                <div className="grid grid-cols-3 items-center">
                    {/* Home Team */}
                    <div className="text-center">
                        {match.teams?.home?.logo && (
                            <img
                                src={match.teams.home.logo}
                                alt={match.teams.home.name}
                                className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain mb-3"
                            />
                        )}
                        <h2 className="text-white font-medium text-sm md:text-base mb-2">{match.teams?.home?.name || 'Home'}</h2>
                        <p className="text-5xl md:text-7xl font-bold text-white tabular-nums">
                            {match.scores?.home?.total ?? 0}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-px h-12 bg-white/10" />
                        <span className="text-gray-600 text-xs font-medium tracking-widest">VS</span>
                        <div className="w-px h-12 bg-white/10" />
                    </div>

                    {/* Away Team */}
                    <div className="text-center">
                        {match.teams?.away?.logo && (
                            <img
                                src={match.teams.away.logo}
                                alt={match.teams.away.name}
                                className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain mb-3"
                            />
                        )}
                        <h2 className="text-white font-medium text-sm md:text-base mb-2">{match.teams?.away?.name || 'Away'}</h2>
                        <p className="text-5xl md:text-7xl font-bold text-white tabular-nums">
                            {match.scores?.away?.total ?? 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quarter Scores */}
            <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                    <h3 className="text-white text-sm font-medium">Score by Quarter</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="py-3 px-4 text-left text-gray-500 text-xs font-medium">Team</th>
                                <th className="py-3 px-4 text-center text-gray-500 text-xs font-medium">Q1</th>
                                <th className="py-3 px-4 text-center text-gray-500 text-xs font-medium">Q2</th>
                                <th className="py-3 px-4 text-center text-gray-500 text-xs font-medium">Q3</th>
                                <th className="py-3 px-4 text-center text-gray-500 text-xs font-medium">Q4</th>
                                {(match.scores?.home?.over_time || match.scores?.away?.over_time) && (
                                    <th className="py-3 px-4 text-center text-gray-500 text-xs font-medium">OT</th>
                                )}
                                <th className="py-3 px-4 text-center text-gray-500 text-xs font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-white/5">
                                <td className="py-3 px-4 text-white text-sm">{match.teams?.home?.name || 'Home'}</td>
                                <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{match.scores?.home?.quarter_1 ?? 0}</td>
                                <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{match.scores?.home?.quarter_2 ?? 0}</td>
                                <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{match.scores?.home?.quarter_3 ?? 0}</td>
                                <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{match.scores?.home?.quarter_4 ?? 0}</td>
                                {(match.scores?.home?.over_time || match.scores?.away?.over_time) && (
                                    <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{match.scores?.home?.over_time ?? 0}</td>
                                )}
                                <td className="py-3 px-4 text-center text-white font-semibold tabular-nums">{match.scores?.home?.total ?? 0}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-white text-sm">{match.teams?.away?.name || 'Away'}</td>
                                <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{match.scores?.away?.quarter_1 ?? 0}</td>
                                <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{match.scores?.away?.quarter_2 ?? 0}</td>
                                <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{match.scores?.away?.quarter_3 ?? 0}</td>
                                <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{match.scores?.away?.quarter_4 ?? 0}</td>
                                {(match.scores?.home?.over_time || match.scores?.away?.over_time) && (
                                    <td className="py-3 px-4 text-center text-gray-400 tabular-nums">{match.scores?.away?.over_time ?? 0}</td>
                                )}
                                <td className="py-3 px-4 text-center text-white font-semibold tabular-nums">{match.scores?.away?.total ?? 0}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Team Statistics */}
            {(homeStats || awayStats) && (
                <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-white text-sm font-medium">Team Stats</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <img src={match.teams?.home?.logo} alt="" className="w-4 h-4 object-contain" />
                                <span className="hidden sm:inline">{match.teams?.home?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline">{match.teams?.away?.name}</span>
                                <img src={match.teams?.away?.logo} alt="" className="w-4 h-4 object-contain" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Field Goals */}
                        {(homeStats?.statistics?.fieldGoalsMade !== undefined || awayStats?.statistics?.fieldGoalsMade !== undefined) && (
                            <div>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="text-white tabular-nums">{homeStats?.statistics?.fieldGoalsMade ?? 0}/{homeStats?.statistics?.fieldGoalsAttempted ?? 0}</span>
                                    <span className="text-gray-500 text-xs">Field Goals</span>
                                    <span className="text-white tabular-nums">{awayStats?.statistics?.fieldGoalsMade ?? 0}/{awayStats?.statistics?.fieldGoalsAttempted ?? 0}</span>
                                </div>
                                <div className="flex h-1 bg-white/5 rounded-full overflow-hidden gap-0.5">
                                    <div className="h-full rounded-full bg-white/50" style={{ width: `${(homeStats?.statistics?.fieldGoalsMade || 0) / ((homeStats?.statistics?.fieldGoalsMade || 0) + (awayStats?.statistics?.fieldGoalsMade || 0) || 1) * 100}%` }} />
                                    <div className="h-full rounded-full bg-white/50 flex-1" />
                                </div>
                            </div>
                        )}
                        {/* 3-Pointers */}
                        {(homeStats?.statistics?.threePointsMade !== undefined || awayStats?.statistics?.threePointsMade !== undefined) && (
                            <div>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="text-white tabular-nums">{homeStats?.statistics?.threePointsMade ?? 0}/{homeStats?.statistics?.threePointsAttempted ?? 0}</span>
                                    <span className="text-gray-500 text-xs">3-Pointers</span>
                                    <span className="text-white tabular-nums">{awayStats?.statistics?.threePointsMade ?? 0}/{awayStats?.statistics?.threePointsAttempted ?? 0}</span>
                                </div>
                                <div className="flex h-1 bg-white/5 rounded-full overflow-hidden gap-0.5">
                                    <div className="h-full rounded-full bg-white/50" style={{ width: `${(homeStats?.statistics?.threePointsMade || 0) / ((homeStats?.statistics?.threePointsMade || 0) + (awayStats?.statistics?.threePointsMade || 0) || 1) * 100}%` }} />
                                    <div className="h-full rounded-full bg-white/50 flex-1" />
                                </div>
                            </div>
                        )}
                        {/* Rebounds */}
                        {(homeStats?.statistics?.reboundsTotal !== undefined || awayStats?.statistics?.reboundsTotal !== undefined) && (() => {
                            const homeVal = homeStats?.statistics?.reboundsTotal ?? 0;
                            const awayVal = awayStats?.statistics?.reboundsTotal ?? 0;
                            const total = homeVal + awayVal || 1;
                            return (
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1.5">
                                        <span className={`tabular-nums ${homeVal > awayVal ? 'text-white font-medium' : 'text-gray-400'}`}>{homeVal}</span>
                                        <span className="text-gray-500 text-xs">Rebounds</span>
                                        <span className={`tabular-nums ${awayVal > homeVal ? 'text-white font-medium' : 'text-gray-400'}`}>{awayVal}</span>
                                    </div>
                                    <div className="flex h-1 bg-white/5 rounded-full overflow-hidden gap-0.5">
                                        <div className={`h-full rounded-full ${homeVal >= awayVal ? 'bg-white' : 'bg-white/30'}`} style={{ width: `${(homeVal / total) * 100}%` }} />
                                        <div className={`h-full rounded-full flex-1 ${awayVal > homeVal ? 'bg-white' : 'bg-white/30'}`} />
                                    </div>
                                </div>
                            );
                        })()}
                        {/* Assists */}
                        {(homeStats?.statistics?.assists !== undefined || awayStats?.statistics?.assists !== undefined) && (() => {
                            const homeVal = homeStats?.statistics?.assists ?? 0;
                            const awayVal = awayStats?.statistics?.assists ?? 0;
                            const total = homeVal + awayVal || 1;
                            return (
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1.5">
                                        <span className={`tabular-nums ${homeVal > awayVal ? 'text-white font-medium' : 'text-gray-400'}`}>{homeVal}</span>
                                        <span className="text-gray-500 text-xs">Assists</span>
                                        <span className={`tabular-nums ${awayVal > homeVal ? 'text-white font-medium' : 'text-gray-400'}`}>{awayVal}</span>
                                    </div>
                                    <div className="flex h-1 bg-white/5 rounded-full overflow-hidden gap-0.5">
                                        <div className={`h-full rounded-full ${homeVal >= awayVal ? 'bg-white' : 'bg-white/30'}`} style={{ width: `${(homeVal / total) * 100}%` }} />
                                        <div className={`h-full rounded-full flex-1 ${awayVal > homeVal ? 'bg-white' : 'bg-white/30'}`} />
                                    </div>
                                </div>
                            );
                        })()}
                        {/* Steals */}
                        {(homeStats?.statistics?.steals !== undefined || awayStats?.statistics?.steals !== undefined) && (() => {
                            const homeVal = homeStats?.statistics?.steals ?? 0;
                            const awayVal = awayStats?.statistics?.steals ?? 0;
                            const total = homeVal + awayVal || 1;
                            return (
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1.5">
                                        <span className={`tabular-nums ${homeVal > awayVal ? 'text-white font-medium' : 'text-gray-400'}`}>{homeVal}</span>
                                        <span className="text-gray-500 text-xs">Steals</span>
                                        <span className={`tabular-nums ${awayVal > homeVal ? 'text-white font-medium' : 'text-gray-400'}`}>{awayVal}</span>
                                    </div>
                                    <div className="flex h-1 bg-white/5 rounded-full overflow-hidden gap-0.5">
                                        <div className={`h-full rounded-full ${homeVal >= awayVal ? 'bg-white' : 'bg-white/30'}`} style={{ width: `${(homeVal / total) * 100}%` }} />
                                        <div className={`h-full rounded-full flex-1 ${awayVal > homeVal ? 'bg-white' : 'bg-white/30'}`} />
                                    </div>
                                </div>
                            );
                        })()}
                        {/* Blocks */}
                        {(homeStats?.statistics?.blocks !== undefined || awayStats?.statistics?.blocks !== undefined) && (() => {
                            const homeVal = homeStats?.statistics?.blocks ?? 0;
                            const awayVal = awayStats?.statistics?.blocks ?? 0;
                            const total = homeVal + awayVal || 1;
                            return (
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1.5">
                                        <span className={`tabular-nums ${homeVal > awayVal ? 'text-white font-medium' : 'text-gray-400'}`}>{homeVal}</span>
                                        <span className="text-gray-500 text-xs">Blocks</span>
                                        <span className={`tabular-nums ${awayVal > homeVal ? 'text-white font-medium' : 'text-gray-400'}`}>{awayVal}</span>
                                    </div>
                                    <div className="flex h-1 bg-white/5 rounded-full overflow-hidden gap-0.5">
                                        <div className={`h-full rounded-full ${homeVal >= awayVal ? 'bg-white' : 'bg-white/30'}`} style={{ width: `${(homeVal / total) * 100}%` }} />
                                        <div className={`h-full rounded-full flex-1 ${awayVal > homeVal ? 'bg-white' : 'bg-white/30'}`} />
                                    </div>
                                </div>
                            );
                        })()}
                        {/* Turnovers */}
                        {(homeStats?.statistics?.turnovers !== undefined || awayStats?.statistics?.turnovers !== undefined) && (() => {
                            const homeVal = homeStats?.statistics?.turnovers ?? 0;
                            const awayVal = awayStats?.statistics?.turnovers ?? 0;
                            const total = homeVal + awayVal || 1;
                            return (
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-1.5">
                                        <span className={`tabular-nums ${homeVal < awayVal ? 'text-white font-medium' : 'text-gray-400'}`}>{homeVal}</span>
                                        <span className="text-gray-500 text-xs">Turnovers</span>
                                        <span className={`tabular-nums ${awayVal < homeVal ? 'text-white font-medium' : 'text-gray-400'}`}>{awayVal}</span>
                                    </div>
                                    <div className="flex h-1 bg-white/5 rounded-full overflow-hidden gap-0.5">
                                        <div className={`h-full rounded-full ${homeVal <= awayVal ? 'bg-white' : 'bg-white/30'}`} style={{ width: `${(homeVal / total) * 100}%` }} />
                                        <div className={`h-full rounded-full flex-1 ${awayVal < homeVal ? 'bg-white' : 'bg-white/30'}`} />
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Match Info */}
            {(match.league?.name || match.country?.name || match.league?.season) && (
                <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5">
                        <h3 className="text-white text-sm font-medium">Match Info</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
                        {match.league?.name && (
                            <div className="p-4 text-center">
                                <div className="text-gray-500 text-xs mb-1">League</div>
                                <div className="text-white text-sm">{match.league.name}</div>
                            </div>
                        )}
                        {match.country?.name && (
                            <div className="p-4 text-center">
                                <div className="text-gray-500 text-xs mb-1">Country</div>
                                <div className="text-white text-sm">{match.country.name}</div>
                            </div>
                        )}
                        {match.league?.season && (
                            <div className="p-4 text-center">
                                <div className="text-gray-500 text-xs mb-1">Season</div>
                                <div className="text-white text-sm">{match.league.season}</div>
                            </div>
                        )}
                        {match.week && (
                            <div className="p-4 text-center">
                                <div className="text-gray-500 text-xs mb-1">Week</div>
                                <div className="text-white text-sm">{match.week}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
