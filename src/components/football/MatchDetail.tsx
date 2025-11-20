"use client"

import { useState } from "react";

export default function MatchDetail({
  home,
  away,
  goals,
  status,
  events,
  lineups,
  statistics
}: any) {
  const [activeTab, setActiveTab] = useState<"events" | "lineups" | "stats">("events");

  const homeLineup = Array.isArray(lineups) ? lineups.find((l: any) => l?.team?.id === home?.id) : null;
  const awayLineup = Array.isArray(lineups) ? lineups.find((l: any) => l?.team?.id === away?.id) : null;

  const homeStats = Array.isArray(statistics) ? statistics.find((s: any) => s?.team?.id === home?.id)?.statistics || [] : [];
  const awayStats = Array.isArray(statistics) ? statistics.find((s: any) => s?.team?.id === away?.id)?.statistics || [] : [];

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 flex flex-col items-center">
            <img src={home?.logo} alt={home?.name} className="w-16 h-16 object-contain mb-2" />
            <div className="text-sm text-gray-300 text-center">{home?.name}</div>
          </div>
          <div className="flex flex-col items-center min-w-[140px]">
            <div className="text-4xl font-extrabold text-green-400">
              {(goals?.home ?? 0)} - {(goals?.away ?? 0)}
            </div>
            <div className="mt-1 text-xs text-gray-400">
              {status?.long} {status?.elapsed ? `• ${status.elapsed}'` : ""}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <img src={away?.logo} alt={away?.name} className="w-16 h-16 object-contain mb-2" />
            <div className="text-sm text-gray-300 text-center">{away?.name}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-colors border ${
            activeTab === "events" ? "bg-white text-black border-white" : "bg-transparent text-white border-white/40 hover:border-white/70"
          }`}
        >
          EVENTS
        </button>
        <button
          onClick={() => setActiveTab("lineups")}
          className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-colors border ${
            activeTab === "lineups" ? "bg-white text-black border-white" : "bg-transparent text-white border-white/40 hover:border-white/70"
          }`}
        >
          LINEUPS
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-colors border ${
            activeTab === "stats" ? "bg-white text-black border-white" : "bg-transparent text-white border-white/40 hover:border-white/70"
          }`}
        >
          STATS
        </button>
      </div>

      {/* Content */}
      {activeTab === "events" && (
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Events</h3>
            <span className="text-xs text-gray-400">{Array.isArray(events) ? events.length : 0} events</span>
          </div>
          {!Array.isArray(events) || events.length === 0 ? (
            <div className="text-sm text-gray-400">No events yet.</div>
          ) : (
            <div className="space-y-3">
              {events.map((ev: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 w-10 text-right">{ev?.time?.elapsed}'</div>
                  <img src={ev?.team?.logo} alt={ev?.team?.name} className="w-5 h-5 object-contain opacity-80" />
                  <div className="flex-1 text-sm text-gray-200">
                    <span className="text-white font-medium">{ev?.player?.name}</span>
                    <span className="text-gray-400"> — {ev?.type}</span>
                    {ev?.detail ? <span className="text-gray-500"> ({ev.detail})</span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "lineups" && (
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 shadow-lg">
          <h3 className="text-white font-semibold mb-4">Lineups</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img src={home?.logo} alt={home?.name} className="w-6 h-6 object-contain" />
                  <span className="text-sm text-white font-medium">{home?.name}</span>
                </div>
                {homeLineup?.formation ? (
                  <span className="text-xs text-gray-400">{homeLineup.formation}</span>
                ) : null}
              </div>
              <div className="rounded-xl border border-white/5">
                <div className="p-3 border-b border-white/5 text-xs text-gray-400">Starting XI</div>
                <ul className="max-h-80 overflow-auto divide-y divide-white/5 scrollbar-hide">
                  {(homeLineup?.startXI || []).map((p: any, i: number) => (
                    <li key={i} className="p-3 text-sm text-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-6 text-right">{p?.player?.number}</span>
                        <span className="text-white">{p?.player?.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{p?.player?.pos}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img src={away?.logo} alt={away?.name} className="w-6 h-6 object-contain" />
                  <span className="text-sm text-white font-medium">{away?.name}</span>
                </div>
                {awayLineup?.formation ? (
                  <span className="text-xs text-gray-400">{awayLineup.formation}</span>
                ) : null}
              </div>
              <div className="rounded-xl border border-white/5">
                <div className="p-3 border-b border-white/5 text-xs text-gray-400">Starting XI</div>
                <ul className="max-h-80 overflow-auto divide-y divide-white/5 scrollbar-hide">
                  {(awayLineup?.startXI || []).map((p: any, i: number) => (
                    <li key={i} className="p-3 text-sm text-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-6 text-right">{p?.player?.number}</span>
                        <span className="text-white">{p?.player?.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{p?.player?.pos}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "stats" && (
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-6 shadow-lg">
          <h3 className="text-white font-semibold mb-4">Stats</h3>
          {(!homeStats.length && !awayStats.length) ? (
            <div className="text-sm text-gray-400">No statistics available.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <img src={home?.logo} alt={home?.name} className="w-5 h-5 object-contain" />
                  <span className="text-sm text-white font-medium">{home?.name}</span>
                </div>
                <ul className="divide-y divide-white/5">
                  {homeStats.map((s: any, i: number) => (
                    <li key={i} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-gray-400">{s?.type}</span>
                      <span className="text-white">{s?.value ?? "-"}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <img src={away?.logo} alt={away?.name} className="w-5 h-5 object-contain" />
                  <span className="text-sm text-white font-medium">{away?.name}</span>
                </div>
                <ul className="divide-y divide-white/5">
                  {awayStats.map((s: any, i: number) => (
                    <li key={i} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-gray-400">{s?.type}</span>
                      <span className="text-white">{s?.value ?? "-"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



