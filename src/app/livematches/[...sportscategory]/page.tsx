'use client'

import { useState, useEffect, JSX } from "react";
import HocketMatchesHandler from "../../api/handlers/sports/hockey";
import MMAMatchesHandler from "../../api/handlers/sports/mma";
import F1MatchesHandler from "../../api/handlers/sports/f1";
import BasketballMatchesHandler from "../../api/handlers/sports/basketball";
import TennisMatchesHandler from "../../api/handlers/sports/tennis";
import NBAMatchesHandler from "../../api/handlers/sports/nba";
import FootballMatchesHandler from "../../api/handlers/sports/football";
import CricketMatchHandler from "../../api/handlers/sports/cricket";
import { NFLMatchesHandler } from "../../api/handlers/sports/nfl";
import Link from "next/link";
import Loader from "@/components/ui/loader";
import { useSearchParams } from "next/navigation";

type Provider = "streamed" | "cdn-live";

interface StreamChannel {
  id: string;
  name: string;
  logoUrl?: string;
  streamUrl?: string;
  source?: string;
  provider?: Provider;
}

interface StreamEvent {
  id: string;
  title: string;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  homeScore?: string;
  awayScore?: string;
  scoreText?: string;
  tournament?: string;
  country?: string;
  status?: string;
  start?: string;
  provider?: Provider;
  channels: StreamChannel[];
}

interface SportStreamsResponse {
  available: boolean;
  sport: string;
  events: StreamEvent[];
  providers?: Provider[];
  reason?: string;
}

interface FollowingWatchItem {
  userId: string;
  userName: string;
  userImage?: string;
  sport: string;
  eventId: string;
  eventTitle: string;
  watchPath: string;
  updatedAt: number;
}

type LiveMatchesParams = { sportscategory: string[] } | Promise<{ sportscategory: string[] }>;

const sportIcons: { [key: string]: string } = {
  nfl: "🏈",
  cricket: "🏏",
  football: "⚽",
  nba: "🏀",
  tennis: "🎾",
  basketball: "🏀",
  formula_1: "🏎️",
  mma: "🥊",
  hockey: "🏒",
};

function formatEventStart(value?: string): string | null {
  if (!value) return null;

  const asNumber = Number(value);
  if (Number.isFinite(asNumber)) {
    const date = new Date(asNumber > 10_000_000_000 ? asNumber : asNumber * 1000);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString();
    }
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString();
  }

  return value;
}

function getStatusLabel(status?: string): { text: string; className: string } {
  const normalized = (status || "").toLowerCase();
  if (normalized === "live") {
    return {
      text: "LIVE",
      className: "border-red-500/35 bg-red-500/15 text-red-300",
    };
  }
  if (normalized === "upcoming") {
    return {
      text: "UPCOMING",
      className: "border-blue-500/35 bg-blue-500/15 text-blue-300",
    };
  }
  if (normalized === "finished") {
    return {
      text: "FINISHED",
      className: "border-white/20 bg-white/10 text-gray-300",
    };
  }
  return {
    text: "SCHEDULED",
    className: "border-white/20 bg-white/10 text-gray-300",
  };
}

export default function LiveMatches({ params }: { params: LiveMatchesParams }) {
  const searchParams = useSearchParams();
  const categories = ["NFL", "Cricket", "Football", "NBA", "Tennis", "Basketball", "Formula_1", "MMA", "Hockey"];
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"scores" | "streams">("scores");

  const [scoresLoading, setScoresLoading] = useState<boolean>(false);
  const [matchesDiv, setMatchesDiv] = useState<JSX.Element | null>(null);

  const [streamsLoading, setStreamsLoading] = useState<boolean>(false);
  const [streamsError, setStreamsError] = useState<string | null>(null);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const [followingWatching, setFollowingWatching] = useState<FollowingWatchItem[]>([]);
  const selectedSportLabel = selectedCategory.replace("_", " ").toUpperCase();

  useEffect(() => {
    async function getSportsCategory() {
      const category: string[] = (await params).sportscategory;
      setSelectedCategory(category[0]);
    }
    getSportsCategory();
  }, [params]);

  useEffect(() => {
    const tab = (searchParams.get("tab") || "").toLowerCase();
    if (tab === "streams") {
      setActiveTab("streams");
      return;
    }
    if (tab === "scores") {
      setActiveTab("scores");
    }
  }, [searchParams]);

  useEffect(() => {
    async function matchesHandler() {
      if (activeTab !== "scores") return;
      setScoresLoading(true);
      if (selectedCategory) {
        let response: JSX.Element = <></>;
        if (selectedCategory === "nfl") {
          try {
            response = await NFLMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        } else if (selectedCategory === "cricket") {
          try {
            response = await CricketMatchHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        } else if (selectedCategory === "football") {
          try {
            response = await FootballMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        } else if (selectedCategory === "nba") {
          try {
            response = await NBAMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        } else if (selectedCategory === "tennis") {
          try {
            response = await TennisMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        } else if (selectedCategory === "basketball") {
          try {
            response = await BasketballMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        } else if (selectedCategory === "formula_1") {
          try {
            response = await F1MatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        } else if (selectedCategory === "mma") {
          try {
            response = await MMAMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        } else if (selectedCategory === "hockey") {
          try {
            response = await HocketMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        setMatchesDiv(response);
      }
      setScoresLoading(false);
    }

    matchesHandler();
  }, [selectedCategory, activeTab]);

  useEffect(() => {
    async function loadSportStreams() {
      if (!selectedCategory || activeTab !== "streams") return;

      try {
        setStreamsLoading(true);
        setStreamsError(null);

        const response = await fetch(`/api/live/sport-streams?sport=${encodeURIComponent(selectedCategory)}`);
        const data = (await response.json()) as SportStreamsResponse;

        if (!response.ok) {
          setStreamEvents([]);
          setStreamsError(data?.reason || "Unable to load stream events.");
          return;
        }

        const events = Array.isArray(data.events) ? data.events : [];
        setStreamEvents(events);

        if (!data.available && data.reason) {
          setStreamsError(data.reason);
        }
      } catch {
        setStreamEvents([]);
        setStreamsError("Unable to load stream events right now.");
      } finally {
        setStreamsLoading(false);
      }
    }

    loadSportStreams();
  }, [selectedCategory, activeTab]);

  useEffect(() => {
    if (activeTab !== "streams") return;

    let disposed = false;

    const loadFollowingWatching = async () => {
      try {
        const response = await fetch("/api/live/watch-presence");
        const data = (await response.json()) as { watching?: FollowingWatchItem[] };
        if (disposed) return;
        setFollowingWatching(Array.isArray(data.watching) ? data.watching : []);
      } catch {
        if (disposed) return;
        setFollowingWatching([]);
      }
    };

    loadFollowingWatching();
    const interval = window.setInterval(loadFollowingWatching, 20_000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [activeTab]);

  return (
    <div className="min-h-[90vh] w-full bg-black text-white flex flex-col">
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="px-4 py-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Live Matches</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Follow live scores and watch streams in one place
              </p>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide -mx-4 md:-mx-8 lg:-mx-12 px-4 md:px-8 lg:px-12">
            <div className="flex gap-2 min-w-max pb-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.toLowerCase();
                const icon = sportIcons[cat.toLowerCase()] || "SP";
                return (
                  <Link
                    key={cat}
                    href={`/livematches/${cat.toLowerCase()}`}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "bg-white text-black"
                        : "bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    <span className="text-base leading-none">{icon}</span>
                    <span>{cat.replace("_", " ")}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto w-full px-4 md:px-8 lg:px-12 py-6">
          <div className="mb-5">
            <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.02] p-1">
              <button
                type="button"
                onClick={() => setActiveTab("scores")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "scores" ? "bg-white text-black" : "text-gray-300 hover:bg-white/10"
                }`}
              >
                Live Scores
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("streams")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "streams" ? "bg-white text-black" : "text-gray-300 hover:bg-white/10"
                }`}
              >
                Live Streams
              </button>
            </div>
          </div>

          {activeTab === "scores" ? (
            scoresLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader size="lg" />
                <p className="text-sm text-gray-500 mt-6">
                  Loading {selectedCategory.replace("_", " ")} matches...
                </p>
              </div>
            ) : matchesDiv ? (
              <section className="space-y-3">
                {matchesDiv}
              </section>
            ) : (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-2xl font-semibold">{sportIcons[selectedCategory] || "SP"}</span>
                </div>
                <p className="text-white font-semibold text-xl mb-2">No matches available</p>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  There are no {selectedCategory.replace("_", " ")} matches scheduled right now. Check back soon!
                </p>
                <Link
                  href="/community"
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-colors"
                >
                  Join Community Discussions
                </Link>
              </div>
            )
          ) : (
            <section className="space-y-4">
              {followingWatching.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">People You Follow Watching Now</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {followingWatching.map((item) => (
                      <Link
                        key={`${item.userId}-${item.eventId}`}
                        href={item.watchPath}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2 hover:bg-white/5 transition-colors"
                      >
                        {item.userImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.userImage} alt={item.userName} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-300">
                            {item.userName.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <p className="text-xs text-gray-200 line-clamp-2">
                          <span className="font-semibold text-white">{item.userName}</span> is watching{" "}
                          <span className="text-blue-400">{item.eventTitle}</span>
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {streamsLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader size="lg" />
                  <p className="text-sm text-gray-500 mt-6">
                    Loading {selectedCategory.replace("_", " ")} streams...
                  </p>
                </div>
              )}

              {!streamsLoading && streamEvents.length === 0 && (
                <div className="py-20 md:py-28 text-center">
                  <p className="text-xl md:text-xl font-medium text-[#9fb0cb]">
                    {streamsError && streamsError.toLowerCase().includes("unable")
                      ? `Unable to load ${selectedSportLabel} streams right now.`
                      : `No live ${selectedSportLabel} streams available`}
                  </p>
                </div>
              )}

              {!streamsLoading && streamEvents.length > 0 && (
                <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
                  {streamEvents.slice(0, 18).map((event) => {
                    const playableCount = (event.channels || []).filter((channel) => Boolean(channel.streamUrl)).length;
                    const hasPlayableStream = playableCount > 0;
                    const startText = formatEventStart(event.start);
                    const statusBadge = getStatusLabel(event.status);
                    const cardClassName = `group block rounded-xl sm:rounded-2xl border p-4 sm:p-6 shadow-lg backdrop-blur-sm transition-all duration-300 ${
                      hasPlayableStream
                        ? "bg-gradient-to-br from-gray-900/40 to-gray-900/20 border-white/10 hover:border-white/20 hover:from-gray-800/60 hover:to-gray-800/40 hover:shadow-2xl hover:scale-[1.02]"
                        : "bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-white/10 opacity-85"
                    }`;

                    const cardBody = (
                      <>
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                           
                            {startText && (
                              <p className="mt-1 text-xs text-gray-400">
                                {event.status?.toLowerCase() === "upcoming" ? "Starts" : "Start"}: {startText}
                              </p>
                            )}
                          </div>
                          <div className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusBadge.className}`}>
                            {statusBadge.text}
                          </div>
                        </div>

                        {event.homeTeam && event.awayTeam ? (
                          <div className="mt-4 flex items-center justify-between gap-2 sm:gap-4">
                            <div className="flex min-w-0 flex-col items-center text-center">
                              {event.homeTeamLogo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={event.homeTeamLogo}
                                  alt={event.homeTeam}
                                  className="mb-2 h-10 w-10 object-contain transition-transform duration-300 sm:h-12 sm:w-12 group-hover:scale-110"
                                />
                              ) : (
                                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-gray-300 sm:h-12 sm:w-12">
                                  {(event.homeTeam || "H").slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <p className="mb-2 line-clamp-2 text-center text-xs font-semibold text-white sm:text-sm">
                                {event.homeTeam || "Home"}
                              </p>
                            </div>

                            <div className="flex flex-col items-center justify-center">
                              <span className="h-12 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">vs</span>
                              <span className="h-12 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                            </div>

                            <div className="flex min-w-0 flex-col items-center text-center">
                              {event.awayTeamLogo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={event.awayTeamLogo}
                                  alt={event.awayTeam}
                                  className="mb-2 h-10 w-10 object-contain transition-transform duration-300 sm:h-12 sm:w-12 group-hover:scale-110"
                                />
                              ) : (
                                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-gray-300 sm:h-12 sm:w-12">
                                  {(event.awayTeam || "A").slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <p className="mb-2 line-clamp-2 text-center text-xs font-semibold text-white sm:text-sm">
                                {event.awayTeam || "Away"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex min-h-[170px] flex-col justify-center">
                            <p className="text-sm font-semibold leading-tight text-white sm:text-base">{event.title}</p>
                          </div>
                        )}

                        
                      </>
                    );

                    if (!hasPlayableStream) {
                      return (
                        <div key={event.id} className={cardClassName}>
                          {cardBody}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={event.id}
                        href={`/livematches/watch?sport=${encodeURIComponent(selectedCategory)}&eventId=${encodeURIComponent(event.id)}`}
                        className={cardClassName}
                      >
                        {cardBody}
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
