import React from "react";
import { isLiveStatus } from "@/lib/liveStatus";

interface MatchCardProps {
  matchId: string | number;
  league: {
    name: string;
    emoji?: string;
    round?: string;
  };
  homeTeam: {
    name: string;
    logo: string;
    goals: number | string;
  };
  awayTeam: {
    name: string;
    logo: string;
    goals: number | string;
  };
  status: {
    long?: string;
    short?: string;
    elapsed?: number;
  };
  venue?: string;
  href: string;
}

export default function MatchCard({
  matchId,
  league,
  homeTeam,
  awayTeam,
  status,
  venue,
  href,
}: MatchCardProps) {
  const isLive = isLiveStatus(status);

  return (
    <a
      href={href}
      className="group block bg-gradient-to-br from-gray-900/40 to-gray-900/20 hover:from-gray-800/60 hover:to-gray-800/40 border border-white/10 hover:border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
    >
      {/* Header - League Info */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-400 px-3 py-1 rounded-full">
            {league.emoji || "🏆"} {league.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-red-400"> </span>
            </div>
          )}
          {status.elapsed && (
            <span className="text-xs text-gray-400">{status.elapsed}'</span>
          )}
        </div>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center">
          <img
            src={homeTeam.logo}
            alt={homeTeam.name}
            className="w-10 h-10 sm:w-12 sm:h-12 mb-2 object-contain group-hover:scale-110 transition-transform duration-300"
          />
          <p className="text-xs sm:text-sm font-semibold text-white text-center line-clamp-2 mb-2">
            {homeTeam.name}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">{homeTeam.goals}</p>
        </div>

        {/* Divider & Status */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            vs
          </span>
          <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center">
          <img
            src={awayTeam.logo}
            alt={awayTeam.name}
            className="w-10 h-10 sm:w-12 sm:h-12 mb-2 object-contain group-hover:scale-110 transition-transform duration-300"
          />
          <p className="text-xs sm:text-sm font-semibold text-white text-center line-clamp-2 mb-2">
            {awayTeam.name}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">{awayTeam.goals}</p>
        </div>
      </div>
    </a>
  );
}
