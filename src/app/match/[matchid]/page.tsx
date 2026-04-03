"use client"

import { BasketballMatchByIdHandler } from "@/app/api/handlers/sports/basketball";
import { CricketMatchByIdHandler } from "@/app/api/handlers/sports/cricket";
import { F1MatchByIdHandler } from "@/app/api/handlers/sports/f1";
import { FootballMatchByIdHandler } from "@/app/api/handlers/sports/football";
import { HockeyMatchByIdHandler } from "@/app/api/handlers/sports/hockey";
import MMAMatchesHandler from "@/app/api/handlers/sports/mma";
import { NBAMatchByIdHandler } from "@/app/api/handlers/sports/nba";
import { NFLMatchByIdHAndler } from "@/app/api/handlers/sports/nfl";
import { TennisMatchByIdHandler } from "@/app/api/handlers/sports/tennis";
import ChatBox from "@/components/ui/chatbox";
import Link from "next/link";
import { JSX, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation";

interface WatchOption {
  id: string;
  label: string;
  url: string;
  logoUrl?: string;
  quality?: string;
  language?: string;
  source: string;
  provider: "cdn-live" | "streamed" | "none";
}

interface ManualCandidate {
  eventId: string;
  title: string;
  start?: string;
  channels: WatchOption[];
}

interface WatchOptionsResponse {
  available: boolean;
  provider: "cdn-live" | "streamed" | "none";
  matchContext: {
    sport: string;
    home?: string;
    away?: string;
    event?: string;
    start?: string;
  };
  options: WatchOption[];
  manualCandidates?: ManualCandidate[];
  reason?: string;
}

interface LiveChannel {
  id: string;
  name: string;
  code?: string;
  logoUrl?: string;
  streamUrl?: string;
}

interface LiveChannelsResponse {
  available: boolean;
  channels: LiveChannel[];
  reason?: string;
}

type MatchParams = { matchid: string } | Promise<{ matchid: string }>;

type SessionUser = {
  id?: string;
  name?: string | null;
  username?: string;
};

export default function Match({ params }: { params: MatchParams }) {
  const showStreamingSections = false;
  const [loading, setLoading] = useState<boolean>(false);
  const socketref = useRef<Socket>(null)
  const [matchId, setMatchId] = useState<string | null>()
  const [messages, setmessages] = useState<Array<{ text: string; type: "sent" | "received"; username?: string }>>([])
  const { data: session } = useSession()
  const [sendmessage, setSendMessage] = useState<string>("")
  const [MatchesDiv, setMatchesDiv] = useState<JSX.Element | null>(null);
  const searchParams = useSearchParams();
  const streamSport = searchParams.get("streamSport");
  const streamHome = searchParams.get("home");
  const streamAway = searchParams.get("away");
  const [watchLoading, setWatchLoading] = useState<boolean>(false);
  const [watchError, setWatchError] = useState<string | null>(null);
  const [watchReason, setWatchReason] = useState<string | null>(null);
  const [watchProvider, setWatchProvider] = useState<"cdn-live" | "streamed" | "none">("none");
  const [watchOptions, setWatchOptions] = useState<WatchOption[]>([]);
  const [manualCandidates, setManualCandidates] = useState<ManualCandidate[]>([]);
  const [selectedStreamId, setSelectedStreamId] = useState<string>("");
  const [contextTitle, setContextTitle] = useState<string | null>(null);
  const [liveChannelsLoading, setLiveChannelsLoading] = useState<boolean>(false);
  const [liveChannelsError, setLiveChannelsError] = useState<string | null>(null);
  const [liveChannels, setLiveChannels] = useState<LiveChannel[]>([]);
  const [channelQuery, setChannelQuery] = useState<string>("");

  // Load messages from localStorage when matchId is set
  useEffect(() => {
    if (matchId) {
      const savedMessages = localStorage.getItem(`match-chat-${matchId}`);
      if (savedMessages) {
        try {
          setmessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error("Failed to parse saved messages:", e);
        }
      }
    }
  }, [matchId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (matchId && messages.length > 0) {
      localStorage.setItem(`match-chat-${matchId}`, JSON.stringify(messages));
    }
  }, [messages, matchId]);

  // Creating the socket client useEffect
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    socketref.current = socket
    async function getMatchId() {
      const resolvedParams = await Promise.resolve(params);
      const matchId = resolvedParams.matchid
      setMatchId(matchId)
    }
    getMatchId()
  }, [params])

  // The socket message Handler
  useEffect(() => {
    if (matchId) {
      socketref.current?.emit("joinroom", matchId);

      socketref.current?.on("receivedmessage", (data: { message: string; username?: string }) => {
        setmessages((prevmessage) => [...prevmessage, { text: data.message, type: "received", username: data.username }])
      })

      return () => {
        socketref.current?.off("receivedmessage")
        socketref.current?.disconnect()
      }
    }
  }, [matchId])


  // Scorecard useEffect
  useEffect(() => {
    async function MatchesHandler() {
      setLoading(true);
      if (matchId) {
        let response: JSX.Element = <></>;

        const helper = matchId.slice(0, 2)
        if (helper === "nf") {
          try {
            response = await NFLMatchByIdHAndler({ id: matchId.slice(2, 8) });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "cr") {
          try {
            response = await CricketMatchByIdHandler({
              id: matchId.slice(2, 8)
            });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "fo") {
          try {
            response = await FootballMatchByIdHandler({
              id: matchId.slice(2, 9)
            });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "nb") {
          try {
            response = await NBAMatchByIdHandler({
              id: matchId.slice(2, 7)
            });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "tn") {
          try {
            response = await TennisMatchByIdHandler({
              id: matchId.slice(2, 10)
            });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "bb") {
          try {
            response = await BasketballMatchByIdHandler({
              id: matchId.slice(2, 7)
            });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "f1") {
          try {
            response = await F1MatchByIdHandler({
              id: matchId.slice(2, 7)
            });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "mm") {
          try {
            response = await MMAMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (helper === "ho") {
          try {
            response = await HockeyMatchByIdHandler({
              id: matchId.slice(2, 7)
            });
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        setMatchesDiv(response);
        setLoading(false);
      }
    }

    MatchesHandler();
  }, [matchId]);

  useEffect(() => {
    async function loadWatchOptions() {
      if (!showStreamingSections) return;
      if (!matchId) {
        setWatchOptions([]);
        setManualCandidates([]);
        setSelectedStreamId("");
        setWatchProvider("none");
        setWatchError(null);
        setWatchReason(null);
        setContextTitle(null);
        return;
      }

      try {
        setWatchLoading(true);
        setWatchError(null);
        setWatchReason(null);

        const query = new URLSearchParams({
          matchId,
        });
        if (streamSport) query.set("sport", streamSport);
        if (streamHome) query.set("home", streamHome);
        if (streamAway) query.set("away", streamAway);

        const response = await fetch(`/api/live/watch-options?${query.toString()}`);
        const data = (await response.json()) as WatchOptionsResponse;

        if (!response.ok) {
          setWatchProvider("none");
          setWatchOptions([]);
          setManualCandidates([]);
          setSelectedStreamId("");
          setWatchError(data?.reason || "Unable to check streaming options.");
          return;
        }

        setWatchProvider(data.provider || "none");
        setWatchReason(data.reason || null);
        setContextTitle(data?.matchContext?.event || null);
        setManualCandidates(Array.isArray(data.manualCandidates) ? data.manualCandidates : []);

        const options = Array.isArray(data.options) ? data.options : [];
        setWatchOptions(options);
        if (options.length > 0) {
          setSelectedStreamId(options[0].id);
          return;
        }
        setSelectedStreamId("");
      } catch {
        setWatchProvider("none");
        setWatchOptions([]);
        setManualCandidates([]);
        setSelectedStreamId("");
        setWatchError("Could not fetch stream data right now.");
      } finally {
        setWatchLoading(false);
      }
    }

    loadWatchOptions();
  }, [matchId, showStreamingSections, streamSport, streamHome, streamAway]);

  const selectedStream = watchOptions.find((option) => option.id === selectedStreamId) || null;

  useEffect(() => {
    async function loadLiveChannels() {
      if (!showStreamingSections) return;
      try {
        setLiveChannelsLoading(true);
        setLiveChannelsError(null);
        const response = await fetch("/api/live/channels");
        const data = (await response.json()) as LiveChannelsResponse;
        if (!response.ok) {
          setLiveChannels([]);
          setLiveChannelsError(data?.reason || "Unable to load channels.");
          return;
        }
        setLiveChannels(Array.isArray(data.channels) ? data.channels : []);
        if (!data.available && data.reason) {
          setLiveChannelsError(data.reason);
        }
      } catch {
        setLiveChannels([]);
        setLiveChannelsError("Unable to load channels right now.");
      } finally {
        setLiveChannelsLoading(false);
      }
    }

    loadLiveChannels();
  }, [showStreamingSections]);

  const filteredChannels = liveChannels.filter((channel) => {
    const q = channelQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      channel.name.toLowerCase().includes(q) ||
      (channel.code || "").toLowerCase().includes(q)
    );
  });

  async function handleSendMessage() {
    const trimmed = sendmessage.trim()
    if (!trimmed || !matchId) return

    const user = (session?.user || null) as SessionUser | null;
    const username = user?.username || user?.name || "Anonymous"
    setmessages((prev) => [...prev, { text: trimmed, type: "sent" }])

    socketref.current?.emit(
      "message",
      {
        roomid: matchId,
        message: trimmed,
        username: username,
      },
    )
    setSendMessage("")
  }

  function handleManualChannelPick(candidate: ManualCandidate, option: WatchOption) {
    const dedupedOptions = candidate.channels.filter(
      (item, index, arr) => arr.findIndex((row) => row.id === item.id) === index
    );
    setWatchOptions(dedupedOptions);
    setSelectedStreamId(option.id);
    setManualCandidates([]);
    setWatchReason(`Using stream from ${candidate.title}`);
  }

  function formatCandidateStart(value?: string) {
    if (!value) return null;
    const asNumber = Number(value);
    const numericDate = Number.isFinite(asNumber) ? new Date(asNumber > 10_000_000_000 ? asNumber : asNumber * 1000) : null;
    if (numericDate && !Number.isNaN(numericDate.getTime())) return numericDate.toLocaleString();
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleString();
    return value;
  }

  // Get sport type for display
  const getSportInfo = () => {
    if (!matchId) return { name: "Match", emoji: "🏆", color: "blue" };
    const helper = matchId.slice(0, 2);
    const sports: Record<string, { name: string; emoji: string; color: string }> = {
      nf: { name: "NFL", emoji: "🏈", color: "amber" },
      cr: { name: "Cricket", emoji: "🏏", color: "green" },
      fo: { name: "Football", emoji: "⚽", color: "blue" },
      nb: { name: "NBA", emoji: "🏀", color: "orange" },
      tn: { name: "Tennis", emoji: "🎾", color: "emerald" },
      bb: { name: "Basketball", emoji: "🏀", color: "orange" },
      f1: { name: "Formula 1", emoji: "🏎️", color: "red" },
      mm: { name: "MMA", emoji: "🥊", color: "red" },
      ho: { name: "Hockey", emoji: "🏒", color: "cyan" },
    };
    return sports[helper] || { name: "Match", emoji: "🏆", color: "blue" };
  };

  const sportInfo = getSportInfo();

  return (
    <div className="min-h-screen  bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Back Button */}
            <Link
              href={`/livematches/${sportInfo.name.toLowerCase().replace(" ", "_")}`}
              className="flex items-center gap-1.5 sm:gap-2 text-gray-400 hover:text-white transition-colors group flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span className="text-sm font-medium hidden sm:inline">Back to matches</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {showStreamingSections && (
          <>
        <section className="mb-4 sm:mb-6 lg:mb-8 rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Streaming</p>
                <h2 className="text-white text-sm sm:text-base font-semibold">
                  {watchLoading
                    ? "Checking stream availability..."
                    : selectedStream
                      ? "Live stream ready"
                      : manualCandidates.length > 0
                        ? "Select your stream source"
                        : "No live stream found"}
                </h2>
                {contextTitle && (
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Match context: {contextTitle}
                  </p>
                )}
                {!!watchReason && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{watchReason}</p>
                )}
                {!!watchError && (
                  <p className="text-xs sm:text-sm text-amber-400 mt-1">{watchError}</p>
                )}
              </div>

              {selectedStream && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById("live-player")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
                  >
                    Watch now
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M8 5.14v14l11-7-11-7Z" />
                    </svg>
                  </button>
                  <a
                    href={selectedStream.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    Open tab
                  </a>
                </div>
              )}
              {!selectedStream && !watchLoading && (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-500 cursor-not-allowed"
                >
                  Watch now
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M8 5.14v14l11-7-11-7Z" />
                  </svg>
                </button>
              )}
            </div>

            {!watchLoading && !selectedStream && (
              <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                No live stream for this match
              </div>
            )}

            {selectedStream && (
              <div className="grid gap-3">
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <label className="text-xs uppercase tracking-wide text-gray-500 sm:w-52">
                    Stream Source
                    <select
                      value={selectedStreamId}
                      onChange={(event) => setSelectedStreamId(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    >
                      {watchOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 uppercase">
                      {watchProvider}
                    </span>
                    <span>{selectedStream.source}</span>
                    {selectedStream.quality && <span>• {selectedStream.quality}</span>}
                    {selectedStream.language && <span>• {selectedStream.language}</span>}
                  </div>
                </div>

                <div id="live-player" className="overflow-hidden rounded-xl border border-white/10 bg-black">
                  <div className="aspect-video w-full">
                    <iframe
                      key={selectedStream.id}
                      src={selectedStream.url}
                      className="h-full w-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            )}

            {!watchLoading && !selectedStream && manualCandidates.length > 0 && (
              <div className="grid gap-3">
                {manualCandidates.map((candidate) => (
                  <div key={candidate.eventId} className="rounded-xl border border-white/10 bg-black/40 p-3">
                    <div className="mb-2">
                      <p className="text-sm font-medium text-white">{candidate.title}</p>
                      {candidate.start && (
                        <p className="text-xs text-gray-500 mt-0.5">{formatCandidateStart(candidate.start)}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {candidate.channels.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleManualChannelPick(candidate, option)}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                        >
                          {option.logoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={option.logoUrl} alt="" className="h-4 w-4 rounded-sm object-contain" />
                          )}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!watchLoading && !selectedStream && manualCandidates.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-gray-400">
                Live watch links are currently unavailable for this match.
              </div>
            )}
          </div>
        </section>

        <section className="mb-4 sm:mb-6 lg:mb-8 rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Live Channels</p>
                <h2 className="text-white text-sm sm:text-base font-semibold">
                  Available channels list
                </h2>
              </div>

              <label className="w-full sm:w-80">
                <input
                  type="text"
                  value={channelQuery}
                  onChange={(event) => setChannelQuery(event.target.value)}
                  placeholder="Search channels..."
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-white/30"
                />
              </label>
            </div>

            {liveChannelsLoading && (
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-gray-400">
                Loading live channels...
              </div>
            )}

            {!liveChannelsLoading && !!liveChannelsError && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
                {liveChannelsError}
              </div>
            )}

            {!liveChannelsLoading && !liveChannelsError && filteredChannels.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-gray-400">
                No channels match your search.
              </div>
            )}

            {!liveChannelsLoading && filteredChannels.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {filteredChannels.slice(0, 120).map((channel) => (
                  <a
                    key={channel.id}
                    href={channel.streamUrl || "#"}
                    target={channel.streamUrl ? "_blank" : undefined}
                    rel={channel.streamUrl ? "noopener noreferrer" : undefined}
                    className={`rounded-lg border border-white/10 bg-black/40 px-3 py-2 flex items-center gap-2 ${
                      channel.streamUrl ? "hover:bg-white/5 transition-colors" : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {channel.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={channel.logoUrl} alt="" className="h-5 w-5 rounded-sm object-contain flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-sm bg-white/10 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-white truncate">{channel.name}</p>
                      {channel.code && (
                        <p className="text-[10px] text-gray-500 truncate uppercase">{channel.code}</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
          </>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Match Details Section */}
          <div className="xl:col-span-7 2xl:col-span-8 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-32 bg-[#111] rounded-2xl border border-white/5">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full border-2 border-white/10" />
                  <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                </div>
                <p className="mt-5 text-sm text-gray-400">Loading match details...</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-auto">
                {MatchesDiv}
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div className="xl:col-span-5 pb-10 2xl:col-span-4 min-w-0">
            <div className="xl:sticky xl:top-24">
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
                <ChatBox
                  matchId={matchId}
                  messages={messages}
                  sendmessage={sendmessage}
                  setSendMessage={setSendMessage}
                  handleSendMessage={handleSendMessage}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
