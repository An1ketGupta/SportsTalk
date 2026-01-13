"use client";

import React from 'react';
import MatchCard from '@/components/MatchCard';
import { sortByLiveStatus } from '@/lib/liveStatus';
import { fetchCricketData } from "@/app/actions/sports";

export default async function CricketMatchesHandler() {
    const url = 'https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/matches/live';
    const json = await fetchCricketData(
        url,
        "Cricbuzz-Official-Cricket-API.allthingsdev.co",
        "e0cb5c72-38e1-435e-8bf0-6b38fbe923b7"
    );

    const data = json || {};
    const response2 = data.typeMatches;
    const matches: any = [];

    if (Array.isArray(response2)) {
        response2.forEach((matchTypeObj) => {
            if (matchTypeObj.seriesMatches) {
                matchTypeObj.seriesMatches.forEach((seriesWrapper: any) => {
                    if (seriesWrapper?.seriesAdWrapper?.matches) {
                        seriesWrapper.seriesAdWrapper.matches.forEach((match: any) => {
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
                    </div>
                ) : (
                    sortedMatches.map((match: any) => {
                        const info = match.matchInfo;
                        const venue = info.venueInfo;
                        const startDate = new Date(Number(info.startDate));

                        const team1Innings = match.matchScore?.team1Score?.inngs1;
                        const team2Innings = match.matchScore?.team2Score?.inngs1;

                        const formatScore = (innings: any) => {
                            if (!innings) return '-';
                            return `${innings.runs ?? 0}/${innings.wickets ?? 0}`;
                        };
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
                                    goals: formatScore(team1Innings),
                                }}
                                awayTeam={{
                                    name: info.team2.teamName,
                                    logo: team2Logo,
                                    goals: formatScore(team2Innings),
                                }}
                                status={{
                                    long: statusLong,
                                    short: statusText,
                                }}
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
    const matchUrl = `https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/match/${id}`;
    const matchData = await fetchCricketData(
        matchUrl,
        "Cricbuzz-Official-Cricket-API.allthingsdev.co",
        "ac951751-d311-4d23-8f18-353e75432353"
    ) || {}; // Handle null fallback

    // Fetch live matches to get score data
    const liveUrl = 'https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/matches/live';
    const liveData = await fetchCricketData(
        liveUrl,
        "Cricbuzz-Official-Cricket-API.allthingsdev.co",
        "e0cb5c72-38e1-435e-8bf0-6b38fbe923b7"
    ) || {};

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

    const isLive = !(info.state?.toLowerCase().includes('complete') || info.status?.toLowerCase().includes('won'));
    const isComplete = info.state?.toLowerCase().includes('complete') || info.status?.toLowerCase().includes('won');

    return (
        <div className="w-full space-y-4 p-4 md:p-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-xl">🏏</span>
                    <div>
                        <h1 className="text-white font-semibold text-lg">{info.seriesname || info.seriesName}</h1>
                        <p className="text-gray-500 text-sm">{info.matchdesc || info.matchDesc}</p>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isLive
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : isComplete
                            ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                    {isLive && <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse" />}
                    {isComplete ? "Completed" : isLive ? "Live" : "Scheduled"}
                </div>
            </div>

            {/* Venue */}
            <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>📍</span>
                <span>{info.venueinfo?.ground || info.venueInfo?.ground}, {info.venueinfo?.city || info.venueInfo?.city}</span>
            </div>

            {/* Main Scoreboard */}
            <div className="bg-[#111] rounded-2xl p-6 md:p-8 border border-white/5">
                <div className="grid grid-cols-3 items-center">
                    {/* Team 1 */}
                    <div className="text-center">
                        <img
                            src={team1Logo}
                            alt={info.team1?.teamname || info.team1?.teamName}
                            className="w-16 h-16 md:w-24 md:h-24 mx-auto object-contain mb-3 rounded-full bg-black/20"
                        />
                        <h2 className="text-white font-medium text-sm md:text-base mb-1">
                            {info.team1?.teamsname || info.team1?.teamSName || info.team1?.teamname || info.team1?.teamName}
                        </h2>

                        {t1Score ? (
                            <div className="mt-2">
                                <p className="text-4xl md:text-5xl font-bold text-white tabular-nums">
                                    {t1Score.runs}<span className="text-2xl md:text-3xl text-gray-500">/{t1Score.wickets}</span>
                                </p>
                                {t1Score.overs > 0 && (
                                    <p className="text-gray-500 text-sm mt-1">({t1Score.overs} ov)</p>
                                )}
                                {t1Score2 && (
                                    <p className="text-gray-400 text-lg mt-1 tabular-nums">
                                        & {t1Score2.runs}/{t1Score2.wickets}
                                        <span className="text-xs text-gray-500 ml-1">({t1Score2.overs} ov)</span>
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-lg mt-2">Yet to bat</p>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-px h-12 bg-white/10" />
                        <span className="text-gray-600 text-xs font-medium tracking-widest">VS</span>
                        <div className="w-px h-12 bg-white/10" />
                    </div>

                    {/* Team 2 */}
                    <div className="text-center">
                        <img
                            src={team2Logo}
                            alt={info.team2?.teamname || info.team2?.teamName}
                            className="w-16 h-16 md:w-24 md:h-24 mx-auto object-contain mb-3 rounded-full bg-black/20"
                        />
                        <h2 className="text-white font-medium text-sm md:text-base mb-1">
                            {info.team2?.teamsname || info.team2?.teamSName || info.team2?.teamname || info.team2?.teamName}
                        </h2>

                        {t2Score ? (
                            <div className="mt-2">
                                <p className="text-4xl md:text-5xl font-bold text-white tabular-nums">
                                    {t2Score.runs}<span className="text-2xl md:text-3xl text-gray-500">/{t2Score.wickets}</span>
                                </p>
                                {t2Score.overs > 0 && (
                                    <p className="text-gray-500 text-sm mt-1">({t2Score.overs} ov)</p>
                                )}
                                {t2Score2 && (
                                    <p className="text-gray-400 text-lg mt-1 tabular-nums">
                                        & {t2Score2.runs}/{t2Score2.wickets}
                                        <span className="text-xs text-gray-500 ml-1">({t2Score2.overs} ov)</span>
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-lg mt-2">Yet to bat</p>
                        )}
                    </div>
                </div>

                {/* Match Status */}
                {info.status && (
                    <div className="mt-6 pt-4 border-t border-white/5 text-center">
                        <p className="text-gray-400 text-sm">{info.status.split('-')[0]}</p>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
                    <div className="p-4 text-center">
                        <div className="text-gray-500 text-xs mb-1">Run Rate</div>
                        <div className="text-white font-semibold tabular-nums">{crr}</div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="text-gray-500 text-xs mb-1">Format</div>
                        <div className="text-white font-semibold">{info.matchformat || info.matchFormat}</div>
                    </div>
                    <div className="p-4 text-center col-span-2">
                        <div className="text-gray-500 text-xs mb-1">Toss</div>
                        <div className="text-white text-sm">{info.tossstatus || '-'}</div>
                    </div>
                </div>
            </div>

            {/* Match Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5">
                        <h3 className="text-white text-sm font-medium">Match Info</h3>
                    </div>
                    <div className="p-4 space-y-3 text-sm">
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
                    <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/5">
                            <h3 className="text-white text-sm font-medium">Venue</h3>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
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

        </div>
    );
}
