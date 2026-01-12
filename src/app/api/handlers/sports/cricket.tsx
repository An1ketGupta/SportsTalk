import React from 'react';
import MatchCard from '@/components/MatchCard';

export default async function CricketMatchesHandler() {
    const response = await fetch('https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/matches/live', {
        method: 'GET',
        headers: {
            'x-apihub-key': "XZmTq6fV04Hz3jKAhkSKbKxuWGDzdczt6yMTRHTM11HTmAKqci",
            'x-apihub-host': "Cricbuzz-Official-Cricket-API.allthingsdev.co",
            'x-apihub-endpoint': "e0cb5c72-38e1-435e-8bf0-6b38fbe923b7",
        },
        next: {
            revalidate: 30
        }
    });

    const data = await response.json();
    const response2 = data.typeMatches;
    const matches:any = [];

    if (Array.isArray(response2)) {
        response2.forEach((matchTypeObj) => {
            if (matchTypeObj.seriesMatches) {
                matchTypeObj.seriesMatches.forEach((seriesWrapper:any) => {
                    if (seriesWrapper?.seriesAdWrapper?.matches) {
                        seriesWrapper.seriesAdWrapper.matches.forEach((match:any) => {
                            matches.push(match);
                        });
                    }
                });
            }
        });
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
                {matches.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <div className="text-gray-400 text-lg font-medium">Loading cricket matches...</div>
                        <p className="text-gray-500 text-sm mt-2">Fetching live scores and match data</p>
                    </div>
                ) : (
                    matches.map((match:any) => {
                    const info = match.matchInfo;
                    const venue = info.venueInfo;
                    const startDate = new Date(Number(info.startDate));

                    const team1Innings = match.matchScore?.team1Score?.inngs1;
                    const team2Innings = match.matchScore?.team2Score?.inngs1;

                    const formatScore = (innings: any) => {
                        if (!innings) return '—';
                        const runs = innings.runs ?? 0;
                        const wickets = innings.wickets ?? 0;
                        const overs = innings.overs ? ` (${innings.overs} ov)` : '';
                        return `${runs}/${wickets}${overs}`;
                    };

                    const team1Score = formatScore(team1Innings);
                    const team2Score = formatScore(team2Innings);

                    const team1Logo = info.team1.imageId 
                        ? `https://static.cricbuzz.com/a/img/v1/i1/c${info.team1.imageId}/i.jpg`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(info.team1.teamSName || info.team1.teamName)}&background=1e293b&color=fff&size=128`;
                    
                    const team2Logo = info.team2.imageId 
                        ? `https://static.cricbuzz.com/a/img/v1/i1/c${info.team2.imageId}/i.jpg`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(info.team2.teamSName || info.team2.teamName)}&background=1e293b&color=fff&size=128`;

                    const statusText = typeof info.status === 'string' ? info.status : 'Live';
                    const statusTone = statusText.toLowerCase().includes('live')
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30'
                        : statusText.toLowerCase().includes('won') || statusText.toLowerCase().includes('result')
                        ? 'bg-blue-500/10 text-blue-200 border-blue-400/30'
                        : 'bg-amber-500/10 text-amber-200 border-amber-400/30';

                    const formattedDate = startDate.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                    });

                    return (
                        <a
                            key={info.matchId}
                            href={`../match/cr${info.matchId}`}
                            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0e1320] via-[#0c1424] to-[#0b101b] p-5 shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl"
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_35%)]" />

                            <div className="relative flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="text-lg">🏏</span>
                                    <span className="font-semibold line-clamp-1">{info.seriesName || 'Cricket Match'}</span>
                                </div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusTone}`}>
                                    {statusText}
                                </span>
                            </div>

                            <div className="relative mt-4 bg-white/5 rounded-xl border border-white/5 p-4">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img src={team1Logo} alt={info.team1.teamName} className="h-9 w-9 rounded-full border border-white/10 object-cover" />
                                            <div className="min-w-0">
                                                <div className="text-white font-semibold truncate">{info.team1.teamName}</div>
                                                <div className="text-gray-400 text-xs">{info.team1.teamSName || info.team1.teamName}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-emerald-300">{team1Score}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img src={team2Logo} alt={info.team2.teamName} className="h-9 w-9 rounded-full border border-white/10 object-cover" />
                                            <div className="min-w-0">
                                                <div className="text-white font-semibold truncate">{info.team2.teamName}</div>
                                                <div className="text-gray-400 text-xs">{info.team2.teamSName || info.team2.teamName}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-blue-200">{team2Score}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                                    <p className="text-sm text-emerald-200 font-semibold">{statusText}</p>
                                    <p className="text-xs text-gray-300">{info.matchDesc || 'Match details'}</p>
                                </div>

                                {statusText && (
                                    <div className="mt-3 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-amber-50 text-xs leading-relaxed line-clamp-3">
                                        {statusText}
                                    </div>
                                )}
                            </div>

                            <div className="relative mt-4 border-t border-white/5 pt-3 flex flex-wrap items-start justify-between gap-4 text-xs text-gray-400">
                                <div className="flex items-start gap-2 min-w-0 w-full sm:w-auto">
                                    <span className="text-lg">📍</span>
                                    <div className="leading-tight">
                                        <div className="text-white font-semibold text-sm truncate">{venue?.ground ?? 'Venue TBA'}</div>
                                        {venue?.city && <div className="text-gray-400">{venue.city}</div>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-lg">⏰</span>
                                    <div className="leading-tight text-right">
                                        <div className="text-white text-sm font-semibold">{formattedDate}</div>
                                        <div className="text-blue-200 font-semibold">View details →</div>
                                    </div>
                                </div>
                            </div>
                        </a>
                    );
                })
                )}
            </div>
        </div>
    );
}


export async function CricketMatchByIdHandler({ id }: { id: string }) {
    const response = await fetch(`https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/match/${id}`, {
        method: 'GET',
        headers: {
            'x-apihub-key': "XZmTq6fV04Hz3jKAhkSKbKxuWGDzdczt6yMTRHTM11HTmAKqci",
            'x-apihub-host': "Cricbuzz-Official-Cricket-API.allthingsdev.co",
            'x-apihub-endpoint': "ac951751-d311-4d23-8f18-353e75432353",
        },
        next: {
            revalidate: 30
        }
    });

    const matchData = await response.json();
    console.log(matchData)
    
    // Handle case where data comes directly (not nested in matchInfo)
    const info = matchData.matchInfo || matchData;
    const scorecard = matchData.scoreCard || [];
    const currentInnings = scorecard[scorecard.length - 1] || {};
    const batsmen = currentInnings.batTeamDetails?.batsmenData || {};
    const bowlers = currentInnings.bowlTeamDetails?.bowlersData || {};

    // Calculate Current Run Rate
    const runs = currentInnings.scoreDetails?.runs || 0;
    const overs = currentInnings.scoreDetails?.overs || 0;
    const crr = overs > 0 ? (runs / overs).toFixed(2) : "0.00";

    // Format date
    const startDate = info.startdate || info.startDate;
    const formattedDate = startDate ? new Date(Number(startDate)).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    }) : "";

    return (
        <div className="bg-[#1a1a1a] w-full border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Match Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-400/30 rounded-full mb-3">
                    <span className="text-2xl">🏏</span>
                    <span className="text-green-400 font-bold text-lg">{info.seriesName || info.seriesname}</span>
                </div>
                <h1 className="text-xl font-bold text-white mb-2">{info.matchDesc || info.matchdesc}</h1>
                <p className="text-gray-400 text-sm">
                    {(info.venueInfo || info.venueinfo)?.ground}, {(info.venueInfo || info.venueinfo)?.city}
                </p>
                <div className="mt-3">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-orange-900/30 text-orange-400 border border-orange-400/20">
                        {info.state || info.status}
                    </span>
                </div>
            </div>

            {/* Team Scores */}
            <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
                {scorecard.length > 0 ? (
                    <div className="space-y-4">
                        {scorecard.map((innings: any, idx: number) => {
                            const teamName = innings.batTeamDetails?.batTeamName || `Team ${idx + 1}`;
                            const score = innings.scoreDetails;
                            return (
                                <div key={idx} className="flex justify-between items-center">
                                    <div>
                                        <span className="text-white font-bold text-2xl">{teamName}</span>
                                        {score && (
                                            <span className="text-green-400 font-black text-3xl ml-4">
                                                {score.runs}/{score.wickets}
                                            </span>
                                        )}
                                        {score?.overs && (
                                            <span className="text-gray-400 text-xl ml-2">
                                                ({score.overs} ov)
                                            </span>
                                        )}
                                    </div>
                                    {idx === scorecard.length - 1 && score?.overs && (
                                        <div className="text-right">
                                            <div className="text-gray-400 text-xs uppercase">CRR</div>
                                            <div className="text-white font-bold text-xl">{crr}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-4">
                            <span className="text-white font-bold text-2xl">
                                {info.team1?.teamName || info.team1?.teamname}
                            </span>
                            <span className="text-gray-400 text-sm">
                                {info.team1?.teamSName || info.team1?.teamsname}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-4">
                            <span className="text-white font-bold text-2xl">
                                {info.team2?.teamName || info.team2?.teamname}
                            </span>
                            <span className="text-gray-400 text-sm">
                                {info.team2?.teamSName || info.team2?.teamsname}
                            </span>
                        </div>
                    </div>
                )}
                {info.status && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-orange-400 font-semibold text-center">{info.status}</p>
                    </div>
                )}
            </div>

            {/* Current Match Situation - Batsmen and Bowlers */}
            {Object.keys(batsmen).length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Current Batsmen */}
                    <div className="lg:col-span-2 bg-black/30 rounded-xl p-6 border border-white/5">
                        <h3 className="text-md font-bold text-gray-400 mb-4 uppercase tracking-wide">Batter</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="py-2 px-3 text-left text-gray-500 font-semibold text-xs"></th>
                                        <th className="py-2 px-2 text-center text-gray-500 font-semibold text-xs">R</th>
                                        <th className="py-2 px-2 text-center text-gray-500 font-semibold text-xs">B</th>
                                        <th className="py-2 px-2 text-center text-gray-500 font-semibold text-xs">4s</th>
                                        <th className="py-2 px-2 text-center text-gray-500 font-semibold text-xs">6s</th>
                                        <th className="py-2 px-2 text-center text-gray-500 font-semibold text-xs">SR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(batsmen)
                                        .filter(([, batsman]: [string, any]) => batsman.isOnStrike || batsman.balls > 0)
                                        .slice(0, 2)
                                        .map(([key, batsman]: [string, any]) => (
                                        <tr key={key} className="border-b border-white/5">
                                            <td className="py-3 px-3 text-white font-medium">
                                                {batsman.batName}
                                                {batsman.isOnStrike && <span className="text-green-400 ml-1">*</span>}
                                            </td>
                                            <td className="py-3 px-2 text-center text-white font-bold">{batsman.runs}</td>
                                            <td className="py-3 px-2 text-center text-gray-300">{batsman.balls}</td>
                                            <td className="py-3 px-2 text-center text-gray-300">{batsman.fours}</td>
                                            <td className="py-3 px-2 text-center text-gray-300">{batsman.sixes}</td>
                                            <td className="py-3 px-2 text-center text-gray-300">{batsman.strikeRate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Key Stats */}
                    <div className="bg-black/30 rounded-xl p-6 border border-white/5">
                        <h3 className="text-md font-bold text-gray-400 mb-4 uppercase tracking-wide">Key Stats</h3>
                        <div className="space-y-3 text-sm">
                            {currentInnings.partnershipsData && currentInnings.partnershipsData.length > 0 && (
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Partnership:</div>
                                    <div className="text-white font-semibold">
                                        {currentInnings.partnershipsData[currentInnings.partnershipsData.length - 1]?.runs}
                                        ({currentInnings.partnershipsData[currentInnings.partnershipsData.length - 1]?.balls})
                                    </div>
                                </div>
                            )}
                            {currentInnings.recentOvsStats && (
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Last 10 overs:</div>
                                    <div className="text-white font-semibold">{currentInnings.recentOvsStats}</div>
                                </div>
                            )}
                            {(info.tossResults || info.tossstatus) && (
                                <div>
                                    <div className="text-gray-500 text-xs mb-1">Toss:</div>
                                    <div className="text-white font-semibold">
                                        {info.tossResults ? `${info.tossResults.tossWinnerName} (${info.tossResults.decision})` : info.tossstatus}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Current Bowlers */}
            {Object.keys(bowlers).length > 0 && (
                <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
                    <h3 className="text-md font-bold text-gray-400 mb-4 uppercase tracking-wide">Bowler</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="py-2 px-3 text-left text-gray-500 font-semibold text-xs"></th>
                                    <th className="py-2 px-2 text-center text-gray-500 font-semibold text-xs">O</th>
                                    <th className="py-2 px-2 text-center text-gray-500 font-semibold text-xs">M</th>
                                    <th className="py-2 px-2 text-center text-gray-500 font-semibold text-xs">R</th>
                                    <th className="py-2 px-2 text-center text-gray-500 font-semibold text-xs">W</th>
                                    <th className="py-2 px-2 text-center text-gray-500 font-semibold text-xs">ECO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(bowlers)
                                    .filter(([, bowler]: [string, any]) => bowler.isCurBowler || bowler.overs > 0)
                                    .slice(0, 2)
                                    .map(([key, bowler]: [string, any]) => (
                                    <tr key={key} className="border-b border-white/5">
                                        <td className="py-3 px-3 text-white font-medium">
                                            {bowler.bowlName}
                                            {bowler.isCurBowler && <span className="text-green-400 ml-1">*</span>}
                                        </td>
                                        <td className="py-3 px-2 text-center text-white font-bold">{bowler.overs}</td>
                                        <td className="py-3 px-2 text-center text-gray-300">{bowler.maidens}</td>
                                        <td className="py-3 px-2 text-center text-gray-300">{bowler.runs}</td>
                                        <td className="py-3 px-2 text-center text-gray-300 font-bold">{bowler.wickets}</td>
                                        <td className="py-3 px-2 text-center text-gray-300">{bowler.economy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Full Batting Scorecard */}
            {Object.keys(batsmen).length > 0 && (
                <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4">Full Batting Scorecard</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="py-3 px-4 text-left text-gray-400 font-semibold">Batter</th>
                                    <th className="py-3 px-2 text-center text-gray-400 font-semibold">R</th>
                                    <th className="py-3 px-2 text-center text-gray-400 font-semibold">B</th>
                                    <th className="py-3 px-2 text-center text-gray-400 font-semibold">4s</th>
                                    <th className="py-3 px-2 text-center text-gray-400 font-semibold">6s</th>
                                    <th className="py-3 px-2 text-center text-gray-400 font-semibold">SR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(batsmen).map(([key, batsman]: [string, any]) => (
                                    <tr key={key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 text-white">
                                            {batsman.batName}
                                            {batsman.isOnStrike && <span className="text-green-400 ml-1">*</span>}
                                            <div className="text-xs text-gray-400 mt-1">{batsman.outDesc || 'not out'}</div>
                                        </td>
                                        <td className="py-4 px-2 text-center text-white font-bold">{batsman.runs}</td>
                                        <td className="py-4 px-2 text-center text-gray-300">{batsman.balls}</td>
                                        <td className="py-4 px-2 text-center text-gray-300">{batsman.fours}</td>
                                        <td className="py-4 px-2 text-center text-gray-300">{batsman.sixes}</td>
                                        <td className="py-4 px-2 text-center text-gray-300">{batsman.strikeRate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Full Bowling Scorecard */}
            {Object.keys(bowlers).length > 0 && (
                <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4">Full Bowling Scorecard</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="py-3 px-4 text-left text-gray-400 font-semibold">Bowler</th>
                                    <th className="py-3 px-2 text-center text-gray-400 font-semibold">O</th>
                                    <th className="py-3 px-2 text-center text-gray-400 font-semibold">M</th>
                                    <th className="py-3 px-2 text-center text-gray-400 font-semibold">R</th>
                                    <th className="py-3 px-2 text-center text-gray-400 font-semibold">W</th>
                                    <th className="py-3 px-2 text-center text-gray-400 font-semibold">ECO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(bowlers).map(([key, bowler]: [string, any]) => (
                                    <tr key={key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 text-white">
                                            {bowler.bowlName}
                                            {bowler.isCaptain && <span className="text-yellow-400 ml-1">(C)</span>}
                                        </td>
                                        <td className="py-4 px-2 text-center text-white font-bold">{bowler.overs}</td>
                                        <td className="py-4 px-2 text-center text-gray-300">{bowler.maidens}</td>
                                        <td className="py-4 px-2 text-center text-gray-300">{bowler.runs}</td>
                                        <td className="py-4 px-2 text-center text-gray-300 font-bold">{bowler.wickets}</td>
                                        <td className="py-4 px-2 text-center text-gray-300">{bowler.economy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Additional Match Details */}
            {currentInnings.extrasData && (
                <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4">Extras & Additional Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {currentInnings.extrasData && (
                            <div>
                                <div className="text-gray-400 text-xs mb-1">Extras</div>
                                <div className="text-white font-bold text-xl">{currentInnings.extrasData.total}</div>
                                {currentInnings.extrasData.byes && <div className="text-gray-500 text-xs">Byes: {currentInnings.extrasData.byes}</div>}
                                {currentInnings.extrasData.legByes && <div className="text-gray-500 text-xs">Leg Byes: {currentInnings.extrasData.legByes}</div>}
                                {currentInnings.extrasData.wides && <div className="text-gray-500 text-xs">Wides: {currentInnings.extrasData.wides}</div>}
                                {currentInnings.extrasData.noBalls && <div className="text-gray-500 text-xs">No Balls: {currentInnings.extrasData.noBalls}</div>}
                            </div>
                        )}
                        <div>
                            <div className="text-gray-400 text-xs mb-1">Format</div>
                            <div className="text-white font-semibold">{info.matchFormat || info.matchformat}</div>
                            {info.matchtype && <div className="text-gray-500 text-xs">{info.matchtype}</div>}
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs mb-1">Date</div>
                            <div className="text-white font-semibold text-sm">{formattedDate}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs mb-1">Current RR</div>
                            <div className="text-white font-bold text-xl">{crr}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Match Officials */}
            {(info.umpire1 || info.umpire2 || info.referee) && (
                <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4">Match Officials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {info.umpire1 && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Umpire 1:</span>
                                <span className="text-white font-medium">{info.umpire1.name} ({info.umpire1.country})</span>
                            </div>
                        )}
                        {info.umpire2 && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Umpire 2:</span>
                                <span className="text-white font-medium">{info.umpire2.name} ({info.umpire2.country})</span>
                            </div>
                        )}
                        {info.umpire3 && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">TV Umpire:</span>
                                <span className="text-white font-medium">{info.umpire3.name} ({info.umpire3.country})</span>
                            </div>
                        )}
                        {info.referee && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Referee:</span>
                                <span className="text-white font-medium">{info.referee.name} ({info.referee.country})</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Match Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🏟️</span>
                        <div className="flex-1">
                            <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Venue</div>
                            <div className="text-white font-medium">{(info.venueInfo || info.venueinfo)?.ground}</div>
                            <div className="text-gray-400 text-sm">{(info.venueInfo || info.venueinfo)?.city}, {(info.venueInfo || info.venueinfo)?.country}</div>
                            {(info.venueInfo || info.venueinfo)?.capacity && (
                                <div className="text-gray-500 text-xs mt-1">Capacity: {(info.venueInfo || info.venueinfo)?.capacity}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📅</span>
                        <div>
                            <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Match</div>
                            <div className="text-white font-medium">{info.matchDesc || info.matchdesc}</div>
                            <div className="text-gray-400 text-sm">{info.matchFormat || info.matchformat}</div>
                            {info.matchtype && (
                                <div className="text-gray-500 text-xs mt-1">{info.matchtype}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🏆</span>
                        <div>
                            <div className="text-gray-400 text-xs uppercase font-semibold mb-1">Series</div>
                            <div className="text-white font-medium text-sm">{info.seriesName || info.seriesname}</div>
                            {formattedDate && (
                                <div className="text-gray-400 text-xs mt-1">{formattedDate}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
    </div>
    );
}