'use client'

import ChatBox from "@/components/ui/chatbox";
import Loader from "@/components/ui/loader";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type Provider = "streamed" | "cdn-live";

type ChatMessage = {
  text: string;
  type: "sent" | "received";
  username?: string;
};

type SessionUser = {
  id?: string;
  name?: string | null;
  username?: string;
};

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
  tournament?: string;
  country?: string;
  start?: string;
  status?: string;
  provider?: Provider;
  channels: StreamChannel[];
}

interface SportStreamsResponse {
  available: boolean;
  sport: string;
  events: StreamEvent[];
  reason?: string;
}

interface StreamOption {
  id: string;
  name: string;
  url: string;
  logoUrl?: string;
  provider?: Provider;
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatEventStart(value?: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

export default function LiveStreamWatchPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sendmessage, setSendMessage] = useState<string>("");

  const streamUrlParam = searchParams.get("url") || "";
  const channelNameParam = searchParams.get("name") || "Live Channel";
  const eventTitleParam = searchParams.get("event") || "Live Event";
  const sport = (searchParams.get("sport") || "sports").toLowerCase();
  const eventId = searchParams.get("eventId") || "";
  const channelId = searchParams.get("channelId") || slugify(channelNameParam) || "channel";

  const [streamLoading, setStreamLoading] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState<string>(eventTitleParam);
  const [eventMeta, setEventMeta] = useState<string>("");
  const [streamOptions, setStreamOptions] = useState<StreamOption[]>([]);
  const [selectedStreamId, setSelectedStreamId] = useState<string>("");

  const roomId = useMemo(() => {
    if (sport && eventId) {
      return `stream-${slugify(sport)}-${slugify(eventId)}`;
    }
    return `stream-${slugify(sport)}-${slugify(eventTitleParam)}-${slugify(channelId)}`;
  }, [sport, eventId, eventTitleParam, channelId]);

  const backHref = useMemo(() => {
    return sport ? `/livematches/${sport}?tab=streams` : "/livematches/football?tab=streams";
  }, [sport]);

  useEffect(() => {
    async function loadStreamOptions() {
      if (!sport || !eventId) {
        if (streamUrlParam) {
          const fallbackOption: StreamOption = {
            id: `fallback-${channelId}`,
            name: channelNameParam,
            url: streamUrlParam,
          };
          setStreamOptions([fallbackOption]);
          setSelectedStreamId(fallbackOption.id);
          setStreamError(null);
          return;
        }
        setStreamError("Missing match stream context.");
        return;
      }

      try {
        setStreamLoading(true);
        setStreamError(null);

        const response = await fetch(`/api/live/sport-streams?sport=${encodeURIComponent(sport)}`);
        const data = (await response.json()) as SportStreamsResponse;

        if (!response.ok) {
          setStreamOptions([]);
          setSelectedStreamId("");
          setStreamError(data?.reason || "Unable to load stream links.");
          return;
        }

        const foundEvent = (Array.isArray(data.events) ? data.events : []).find((event) => event.id === eventId);
        if (!foundEvent) {
          setStreamOptions([]);
          setSelectedStreamId("");
          setStreamError("Match not found or no longer live.");
          return;
        }

        const resolvedTitle =
          foundEvent.homeTeam && foundEvent.awayTeam
            ? `${foundEvent.homeTeam} vs ${foundEvent.awayTeam}`
            : foundEvent.title;

        setEventTitle(resolvedTitle);
        const startText = formatEventStart(foundEvent.start);
        const statusText = foundEvent.status ? foundEvent.status.toUpperCase() : "";
        setEventMeta([foundEvent.tournament, foundEvent.country, statusText, startText].filter(Boolean).join(" - "));

        const options = (foundEvent.channels || [])
          .filter((channel) => Boolean(channel.streamUrl))
          .map((channel, index) => ({
            id: `${channel.id}-${index}`,
            name: channel.name,
            url: channel.streamUrl as string,
            logoUrl: channel.logoUrl,
            provider: channel.provider,
          }));

        if (options.length === 0 && streamUrlParam) {
          const fallbackOption: StreamOption = {
            id: `fallback-${channelId}`,
            name: channelNameParam,
            url: streamUrlParam,
          };
          setStreamOptions([fallbackOption]);
          setSelectedStreamId(fallbackOption.id);
          return;
        }

        setStreamOptions(options);
        setSelectedStreamId(options[0]?.id || "");
        if (options.length === 0) {
          setStreamError("No stream links available for this match right now.");
        }
      } catch {
        setStreamOptions([]);
        setSelectedStreamId("");
        setStreamError("Unable to load stream options right now.");
      } finally {
        setStreamLoading(false);
      }
    }

    loadStreamOptions();
  }, [sport, eventId, streamUrlParam, channelNameParam, channelId]);

  useEffect(() => {
    if (!session?.user?.id || !sport || !eventId || !eventTitle) return;

    let disposed = false;

    const pushPresence = async () => {
      if (disposed) return;
      try {
        await fetch("/api/live/watch-presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sport,
            eventId,
            eventTitle,
          }),
        });
      } catch {
        // Presence updates are best-effort only.
      }
    };

    pushPresence();
    const interval = window.setInterval(pushPresence, 30_000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      fetch("/api/live/watch-presence", {
        method: "DELETE",
        keepalive: true,
      }).catch(() => {});
    };
  }, [session?.user?.id, sport, eventId, eventTitle]);

  const selectedStream =
    streamOptions.find((option) => option.id === selectedStreamId) ||
    (streamUrlParam
      ? {
          id: `direct-${channelId}`,
          name: channelNameParam,
          url: streamUrlParam,
        }
      : null);

  useEffect(() => {
    if (!roomId) return;
    const savedMessages = localStorage.getItem(`stream-chat-${roomId}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId || messages.length === 0) return;
    localStorage.setItem(`stream-chat-${roomId}`, JSON.stringify(messages));
  }, [messages, roomId]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl) return;
    const socket = io(socketUrl);
    socketRef.current = socket;

    return () => {
      socket.off("receivedmessage");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!roomId || !socketRef.current) return;

    socketRef.current.emit("joinroom", roomId);

    const onReceivedMessage = (data: { message: string; username?: string }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.message, type: "received", username: data.username },
      ]);
    };

    socketRef.current.on("receivedmessage", onReceivedMessage);

    return () => {
      socketRef.current?.off("receivedmessage", onReceivedMessage);
    };
  }, [roomId]);

  async function handleSendMessage() {
    const trimmedMessage = sendmessage.trim();
    if (!trimmedMessage || !roomId) return;

    const user = (session?.user || null) as SessionUser | null;
    const username = user?.username || user?.name || "Anonymous";

    setMessages((prevMessages) => [...prevMessages, { text: trimmedMessage, type: "sent" }]);
    socketRef.current?.emit("message", {
      roomid: roomId,
      message: trimmedMessage,
      username,
    });
    setSendMessage("");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
          >
            <span aria-hidden>{"<-"}</span>
            Back to streams
          </Link>
          <div className="min-w-0 text-right">
            <p className="truncate text-xs uppercase tracking-wider text-gray-500">{sport.replace("_", " ")}</p>
            <p className="truncate text-sm font-semibold text-white">{eventTitle}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col gap-6 lg:flex-row">
          <section className="min-w-0 flex-1">
            <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-end gap-3 justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{eventTitle}</p>
                  <p className="truncate text-xs text-gray-500">{eventMeta || "Live stream"}</p>
                </div>
              </div>

              <div className="mb-3 rounded-xl border border-white/10 bg-black/30 p-3">
                <label className="block text-xs uppercase tracking-wide text-gray-500">
                  Select stream link
                  <select
                    value={selectedStreamId}
                    onChange={(event) => setSelectedStreamId(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    disabled={streamLoading || streamOptions.length === 0}
                  >
                    {streamOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                    {streamOptions.length === 0 && <option>No stream links available</option>}
                  </select>
                </label>
              </div>

              {streamLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader size="lg" />
                  <p className="mt-6 text-sm text-gray-500">Loading stream links...</p>
                </div>
              )}

              {!streamLoading && streamError && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
                  {streamError}
                </div>
              )}

              {!streamLoading && !streamError && selectedStream?.url && (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
                  <div className="aspect-video w-full">
                    <iframe
                      key={selectedStream.url}
                      src={selectedStream.url}
                      className="h-full w-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="w-full shrink-0 lg:w-[360px] xl:w-[420px]">
            <div className="lg:sticky lg:top-24">
              <ChatBox
                matchId={roomId}
                messages={messages}
                sendmessage={sendmessage}
                setSendMessage={setSendMessage}
                handleSendMessage={handleSendMessage}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
