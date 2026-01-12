"use client";

import React from 'react';
import MatchCard from '@/components/MatchCard';
import { sortByLiveStatus } from '@/lib/liveStatus';

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

    const sortedMatches = sortByLiveStatus(matches, (match: any) => match?.matchInfo?.status || match?.matchInfo?.state);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
                {sortedMatches.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <div className="text-gray-400 text-lg font-medium">No live matches available</div>
                        <p className="text-gray-500 text-sm mt-2">No live cricket matches right now</p>
                    </div>
                ) : (
                    sortedMatches.map((match:any) => {
                        const info = match.matchInfo;
                        const venue = info.venueInfo;
                        const startDate = new Date(Number(info.startDate));

                        const team1Innings = match.matchScore?.team1Score?.inngs1;
                        const team2Innings = match.matchScore?.team2Score?.inngs1;

                        const runsOnly = (innings: any) => innings?.runs ?? 0;
                        const wickets = (innings: any) => innings?.wickets ?? 0;
                        const overs = (innings: any) => innings?.overs ? `${innings.overs} ov` : '';

                        const team1Logo = info.team1.imageId 
                            ? `https://static.cricbuzz.com/a/img/v1/i1/c${info.team1.imageId}/i.jpg`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(info.team1.teamSName || info.team1.teamName)}&background=1e293b&color=fff&size=128`;
                        
                        const team2Logo = info.team2.imageId 
                            ? `https://static.cricbuzz.com/a/img/v1/i1/c${info.team2.imageId}/i.jpg`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(info.team2.teamSName || info.team2.teamName)}&background=1e293b&color=fff&size=128`;

                        const statusText = typeof info.status === 'string' ? info.status : 'Live';
                        const statusLong = `${statusText}${team1Innings || team2Innings ? ' • ' : ''}${team1Innings ? `${team1Innings.runs}/${wickets(team1Innings)}${overs(team1Innings) ? ` (${overs(team1Innings)})` : ''}` : ''}${team2Innings ? ` vs ${team2Innings.runs}/${wickets(team2Innings)}${overs(team2Innings) ? ` (${overs(team2Innings)})` : ''}` : ''}`;

                        return (
                            <MatchCard
                                key={info.matchId}
                                matchId={info.matchId}
                                league={{
                                    name: info.seriesName || 'Cricket Match',
                                    emoji: '🏏',
                                }}
                                homeTeam={{
                                    name: info.team1.teamName,
                                    logo: team1Logo,
                                    goals: runsOnly(team1Innings),
                                }}
                                awayTeam={{
                                    name: info.team2.teamName,
                                    logo: team2Logo,
                                    goals: runsOnly(team2Innings),
                                }}
                                status={{
                                    long: statusLong,
                                    short: statusText,
                                }}
                                venue={`${venue?.ground ?? 'Venue TBA'}${venue?.city ? `, ${venue.city}` : ''}`}
                                href={`../match/cr${info.matchId}`}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}


export async function CricketMatchByIdHandler({ id }: { id: string }) {
    // Fetch match details
    const matchResponse = await fetch(`https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/match/${id}`, {
        method: 'GET',
        headers: {
            'x-apihub-key': "XZmTq6fV04Hz3jKAhkSKbKxuWGDzdczt6yMTRHTM11HTmAKqci",
            'x-apihub-host': "Cricbuzz-Official-Cricket-API.allthingsdev.co",
            'x-apihub-endpoint': "ac951751-d311-4d23-8f18-353e75432353",
        },
        next: { revalidate: 30 }
    });

    // Fetch live matches to get score data
    const liveResponse = await fetch('https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/matches/live', {
        method: 'GET',
        headers: {
            'x-apihub-key': "XZmTq6fV04Hz3jKAhkSKbKxuWGDzdczt6yMTRHTM11HTmAKqci",
            'x-apihub-host': "Cricbuzz-Official-Cricket-API.allthingsdev.co",
            'x-apihub-endpoint': "e0cb5c72-38e1-435e-8bf0-6b38fbe923b7",
        },
        next: { revalidate: 30 }
    });

    const matchData = await matchResponse.json();
    const liveData = await liveResponse.json();
    
    // Find this match in live matches to get the score
    let matchScore: any = null;
    const typeMatches = liveData.typeMatches || [];
    
    for (const typeMatch of typeMatches) {
        if (typeMatch.seriesMatches) {
            for (const seriesWrapper of typeMatch.seriesMatches) {
                const matches = seriesWrapper?.seriesAdWrapper?.matches || [];
                for (const match of matches) {
                    if (match.matchInfo?.matchId === Number(id)) {
                        matchScore = match.matchScore;
                        break;
                    }
                }
            }
        }
    }

    // The single match endpoint returns lowercase keys
    const info = matchData;
    
    // Get team scores from matchScore (from live endpoint)
    const team1Score = matchScore?.team1Score?.inngs1;
    const team2Score = matchScore?.team2Score?.inngs1;
    const team1Score2 = matchScore?.team1Score?.inngs2; // For test matches
    const team2Score2 = matchScore?.team2Score?.inngs2;

    // Get team logos
    const team1Logo = info.team1?.imageid 
        ? `https://static.cricbuzz.com/a/img/v1/i1/c${info.team1.imageid}/i.jpg`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(info.team1?.teamsname || info.team1?.teamname || 'T1')}&background=1e293b&color=22c55e&size=128&bold=true`;
    
    const team2Logo = info.team2?.imageid 
        ? `https://static.cricbuzz.com/a/img/v1/i1/c${info.team2.imageid}/i.jpg`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(info.team2?.teamsname || info.team2?.teamname || 'T2')}&background=1e293b&color=22c55e&size=128&bold=true`;

    return <CricketMatchUI 
        info={info}
        team1Score={team1Score}
        team2Score={team2Score}
        team1Score2={team1Score2}
        team2Score2={team2Score2}
        team1Logo={team1Logo}
        team2Logo={team2Logo}
        matchScore={matchScore}
    />;
}


function CricketMatchUI({
    info,
    team1Score,
    team2Score,
    team1Score2,
    team2Score2,
    team1Logo,
    team2Logo,
    matchScore
}: {
    info: any;
    team1Score: any;
    team2Score: any;
    team1Score2?: any;
    team2Score2?: any;
    team1Logo: string;
    team2Logo: string;
    matchScore: any;
}) {
    // Calculate CRR for current batting team
    const currentScore = team1Score?.runs !== undefined ? team1Score : team2Score;
    const crr = currentScore?.overs > 0 ? (currentScore.runs / currentScore.overs).toFixed(2) : "0.00";

    // Helper to format score
    const formatScore = (score: any) => {
        if (!score) return null;
        return {
            runs: score.runs ?? 0,
            wickets: score.wickets ?? 0,
            overs: score.overs ?? 0
        };
    };

    const t1Score = formatScore(team1Score);
    const t2Score = formatScore(team2Score);
    const t1Score2 = formatScore(team1Score2);
    const t2Score2 = formatScore(team2Score2);

    return (
        <div className="bg-[#1a1a1a] w-full border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            {/* Header with Series & Venue */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-400/30 rounded-full mb-3">
                    <span className="text-2xl">🏏</span>
                    <span className="text-green-400 font-bold text-lg">{info.seriesname || info.seriesName}</span>
                </div>
                <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                    <span>🏟️</span>
                    {info.venueinfo?.ground || info.venueInfo?.ground}, {info.venueinfo?.city || info.venueInfo?.city}
                </p>
            </div>

            {/* Main Score Display */}
            <div className="bg-gradient-to-br from-green-900/10 to-transparent rounded-2xl p-6 border border-green-500/10">
                <div className="flex items-center justify-between gap-4">
                    {/* Team 1 */}
                    <div className="flex-1 text-center">
                        <img 
                            src={team1Logo} 
                            alt={info.team1?.teamname || info.team1?.teamName} 
                            className="w-20 h-20 md:w-24 md:h-24 mx-auto object-contain mb-3 rounded-full bg-black/20 p-2" 
                        />
                        <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                            {info.team1?.teamname || info.team1?.teamName}
                        </h2>
                        <p className="text-gray-500 text-sm mb-2">{info.team1?.teamsname || info.team1?.teamSName}</p>
                        
                        {t1Score ? (
                            <>
                                <div className="text-4xl md:text-5xl font-black text-green-400">
                                    {t1Score.runs}
                                    <span className="text-2xl md:text-3xl text-gray-400">/{t1Score.wickets}</span>
                                </div>
                                {t1Score.overs > 0 && (
                                    <p className="text-gray-400 text-sm mt-1">({t1Score.overs} ov)</p>
                                )}
                                {/* Second innings for test matches */}
                                {t1Score2 && (
                                    <div className="mt-2 text-xl text-gray-300">
                                        & {t1Score2.runs}/{t1Score2.wickets}
                                        <span className="text-sm text-gray-500 ml-1">({t1Score2.overs} ov)</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-2xl text-gray-500">Yet to bat</div>
                        )}
                    </div>

                    {/* VS Divider */}
                    <div className="flex flex-col items-center px-2 md:px-4">
                        <div className="text-gray-600 font-bold text-lg">VS</div>
                        <div className="h-12 w-px bg-gradient-to-b from-transparent via-green-500/30 to-transparent my-2"></div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            info.state?.toLowerCase().includes('complete') || info.status?.toLowerCase().includes('won')
                                ? "bg-gray-700 text-gray-300" 
                                : "bg-green-500/20 text-green-400 animate-pulse"
                        }`}>
                            {info.state?.toLowerCase().includes('complete') ? "COMPLETED" : "LIVE"}
                        </span>
                    </div>

                    {/* Team 2 */}
                    <div className="flex-1 text-center">
                        <img 
                            src={team2Logo} 
                            alt={info.team2?.teamname || info.team2?.teamName} 
                            className="w-20 h-20 md:w-24 md:h-24 mx-auto object-contain mb-3 rounded-full bg-black/20 p-2" 
                        />
                        <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                            {info.team2?.teamname || info.team2?.teamName}
                        </h2>
                        <p className="text-gray-500 text-sm mb-2">{info.team2?.teamsname || info.team2?.teamSName}</p>
                        
                        {t2Score ? (
                            <>
                                <div className="text-4xl md:text-5xl font-black text-green-400">
                                    {t2Score.runs}
                                    <span className="text-2xl md:text-3xl text-gray-400">/{t2Score.wickets}</span>
                                </div>
                                {t2Score.overs > 0 && (
                                    <p className="text-gray-400 text-sm mt-1">({t2Score.overs} ov)</p>
                                )}
                                {/* Second innings for test matches */}
                                {t2Score2 && (
                                    <div className="mt-2 text-xl text-gray-300">
                                        & {t2Score2.runs}/{t2Score2.wickets}
                                        <span className="text-sm text-gray-500 ml-1">({t2Score2.overs} ov)</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-2xl text-gray-500">Yet to bat</div>
                        )}
                    </div>
                </div>

                {/* Match Status */}
                {info.status && (
                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                        <p className="text-orange-400 font-semibold">{info.status.split('-')[0]}</p>
                    </div>
                )}
            </div>

            {/* Key Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-center">
                    <div className="text-gray-500 text-xs uppercase mb-1">Run Rate</div>
                    <div className="text-green-400 font-bold text-2xl">{crr}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-center">
                    <div className="text-gray-500 text-xs uppercase mb-1">Format</div>
                    <div className="text-white font-bold text-lg">{info.matchformat || info.matchFormat}</div>
                </div>
                {info.tossstatus && (
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-center col-span-2">
                        <div className="text-gray-500 text-xs uppercase mb-1">Toss</div>
                        <div className="text-white font-semibold text-sm">{info.tossstatus}</div>
                    </div>
                )}
            </div>

            {/* Match Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-xl p-5 border border-white/5">
                    <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">Match Info</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Match</span>
                            <span className="text-white">{info.matchdesc || info.matchDesc}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Type</span>
                            <span className="text-white">{info.matchtype || info.matchType || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">State</span>
                            <span className="text-white">{info.state}</span>
                        </div>
                    </div>
                </div>

                {(info.venueinfo || info.venueInfo) && (
                    <div className="bg-black/30 rounded-xl p-5 border border-white/5">
                        <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">Venue</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ground</span>
                                <span className="text-white">{info.venueinfo?.ground || info.venueInfo?.ground}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">City</span>
                                <span className="text-white">{info.venueinfo?.city || info.venueInfo?.city}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Country</span>
                                <span className="text-white">{info.venueinfo?.country || info.venueInfo?.country}</span>
                            </div>
                            {(info.venueinfo?.capacity || info.venueInfo?.capacity) && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Capacity</span>
                                    <span className="text-white">{info.venueinfo?.capacity || info.venueInfo?.capacity}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Match Officials */}
            {(info.umpire1 || info.umpire2 || info.referee) && (
                <div className="bg-black/30 rounded-xl p-5 border border-white/5">
                    <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">Match Officials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {info.umpire1 && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Umpire 1</span>
                                <span className="text-white">{info.umpire1.name} ({info.umpire1.country})</span>
                            </div>
                        )}
                        {info.umpire2 && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Umpire 2</span>
                                <span className="text-white">{info.umpire2.name} ({info.umpire2.country})</span>
                            </div>
                        )}
                        {info.umpire3 && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">TV Umpire</span>
                                <span className="text-white">{info.umpire3.name} ({info.umpire3.country})</span>
                            </div>
                        )}
                        {info.referee && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Referee</span>
                                <span className="text-white">{info.referee.name} ({info.referee.country})</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* No Score Available Message */}
            {!matchScore && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                    <p className="text-yellow-400 text-sm">📊 Detailed scorecard will be available once the match starts</p>
                </div>
            )}
        </div>
    );
}
