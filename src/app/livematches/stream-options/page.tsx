'use client'

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Loader from "@/components/ui/loader";

interface StreamChannel {
  id: string;
  name: string;
  logoUrl?: string;
  streamUrl?: string;
  source?: string;
  provider?: "cdn-live" | "streamed";
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
  provider?: "cdn-live" | "streamed";
  channels: StreamChannel[];
}

interface SportStreamsResponse {
  available: boolean;
  sport: string;
  events: StreamEvent[];
  reason?: string;
}

export default function StreamOptionsPage() {
  const searchParams = useSearchParams();
  const sport = (searchParams.get("sport") || "").toLowerCase();
  const eventId = searchParams.get("eventId") || "";

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<StreamEvent | null>(null);

  useEffect(() => {
    async function loadEvent() {
      if (!sport || !eventId) {
        setError("Missing sport or event id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/live/sport-streams?sport=${encodeURIComponent(sport)}`);
        const data = (await response.json()) as SportStreamsResponse;

        if (!response.ok) {
          setError(data?.reason || "Unable to load stream events.");
          setEvent(null);
          return;
        }

        const found = (Array.isArray(data.events) ? data.events : []).find((item) => item.id === eventId) || null;
        if (!found) {
          setError("Match not found or no longer live.");
          setEvent(null);
          return;
        }

        setEvent(found);
      } catch {
        setError("Unable to load stream options right now.");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [sport, eventId]);

  const streamChannels = useMemo(
    () => (event?.channels || []).filter((channel) => Boolean(channel.streamUrl)).slice(0, 20),
    [event]
  );

  return (
    <div className="min-h-[90vh] w-full bg-black text-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 lg:px-12">
        <div className="mb-5">
          <Link
            href={`/livematches/${sport || "basketball"}`}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
          >
            <span aria-hidden>←</span>
            Back to matches
          </Link>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader size="lg" />
            <p className="mt-6 text-sm text-gray-500">Loading stream links...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
            {error}
          </div>
        )}

        {!loading && !error && event && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="mb-3 text-xs uppercase tracking-wider text-gray-500">
                {event.tournament || event.country || "League"}
              </p>
              {event.homeTeam && event.awayTeam ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {event.homeTeamLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.homeTeamLogo} alt={event.homeTeam} className="h-10 w-10 rounded-full bg-white/5 p-1 object-contain" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-white/10" />
                    )}
                    <span className="truncate text-base font-semibold text-white">{event.homeTeam}</span>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-gray-500">vs</span>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="truncate text-base font-semibold text-white text-right">{event.awayTeam}</span>
                    {event.awayTeamLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.awayTeamLogo} alt={event.awayTeam} className="h-10 w-10 rounded-full bg-white/5 p-1 object-contain" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-white/10" />
                    )}
                  </div>
                </div>
              ) : (
                <h1 className="text-base font-semibold text-white">{event.title}</h1>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <h2 className="text-sm font-semibold text-white">Stream Links</h2>
              <p className="mt-1 text-xs text-gray-500">Choose a website option to watch this match.</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {streamChannels.map((channel) => {
                  const watchParams = new URLSearchParams({
                    url: channel.streamUrl || "",
                    name: channel.name,
                    event: event.title,
                    sport,
                    eventId: event.id,
                    channelId: channel.id,
                    provider: channel.provider || event.provider || "",
                  });

                  return (
                    <Link
                      key={channel.id}
                      href={`/livematches/watch?${watchParams.toString()}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors"
                    >
                      {channel.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={channel.logoUrl} alt="" className="h-4 w-4 rounded-sm object-contain" />
                      )}
                      <span className="max-w-[180px] truncate">{channel.name}</span>
                    </Link>
                  );
                })}
                {streamChannels.length === 0 && (
                  <p className="text-xs text-gray-400">No stream links available for this match right now.</p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
