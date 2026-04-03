/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

type Provider = "streamed" | "cdn-live";

interface StreamChannel {
  id: string;
  name: string;
  logoUrl?: string;
  streamUrl?: string;
  source?: string;
  provider: Provider;
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
  tournament?: string;
  country?: string;
  status?: string;
  start?: string;
  provider: Provider;
  channels: StreamChannel[];
}

interface SportStreamsResponse {
  available: boolean;
  sport: string;
  events: StreamEvent[];
  providers: Provider[];
  reason?: string;
}

interface StreamedSource {
  source: string;
  id: string;
}

interface StreamedTeamInfo {
  name?: string;
  badge?: string;
}

interface StreamedMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  teams?: {
    home?: StreamedTeamInfo;
    away?: StreamedTeamInfo;
  };
  sources: StreamedSource[];
}

interface StreamedStream {
  id: string;
  streamNo: number;
  language?: string;
  hd?: boolean;
  embedUrl?: string;
}

const DLSTREAMS_BASE = "https://dlstreams.top";
const CDNLIVE_BASE = "https://api.cdn-live.tv/api/v1/events/sports";
const CDNLIVE_USER = process.env.CDNLIVE_USER || "cdnlivetv";
const CDNLIVE_PLAN = process.env.CDNLIVE_PLAN || "free";

const STREAMED_SPORT_MAP: Record<string, string> = {
  football: "football",
  soccer: "football",
  nba: "basketball",
  basketball: "basketball",
  tennis: "tennis",
  hockey: "hockey",
  mma: "mma",
};

const CDNLIVE_SPORT_MAP: Record<string, string> = {
  football: "soccer",
  soccer: "soccer",
  nba: "nba",
  basketball: "basketball",
  tennis: "tennis",
  hockey: "hockey",
  nfl: "nfl",
  cricket: "cricket",
  mma: "mma",
  formula_1: "motorsport",
  motorsport: "motorsport",
};

const MAX_MATCHES = 24;
const MAX_SOURCES_PER_MATCH = 3;
const MAX_STREAMS_PER_SOURCE = 6;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toScoreString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length ? text : undefined;
}

function normalizeLogo(logo?: string): string | undefined {
  if (!logo) return undefined;
  if (/^https?:\/\//i.test(logo)) return logo;
  return `${DLSTREAMS_BASE}/${logo.replace(/^\//, "")}`;
}

function normalizeStreamedBadge(badge?: string): string | undefined {
  if (!badge) return undefined;
  if (/^https?:\/\//i.test(badge)) return badge;
  if (badge.startsWith("/")) return `https://streamed.pk${badge}`;
  if (badge.includes("/")) return `https://streamed.pk/${badge.replace(/^\//, "")}`;
  return `https://streamed.pk/api/images/badge/${badge}.webp`;
}

function formatStartFromMs(timestampMs?: number): string | undefined {
  if (!timestampMs || Number.isNaN(timestampMs)) return undefined;
  const date = new Date(timestampMs);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function getStreamedStatus(timestampMs?: number): string | undefined {
  if (!timestampMs) return undefined;
  const now = Date.now();
  if (timestampMs > now + 5 * 60 * 1000) return "upcoming";
  if (timestampMs < now - 8 * 60 * 60 * 1000) return "finished";
  return "live";
}

function normalizeStreamedEvent(match: StreamedMatch, channels: StreamChannel[]): StreamEvent {
  const homeTeam = match.teams?.home?.name;
  const awayTeam = match.teams?.away?.name;

  return {
    id: `streamed-${match.id}`,
    title: match.title || (homeTeam && awayTeam ? `${homeTeam} vs ${awayTeam}` : "Live Event"),
    homeTeam,
    awayTeam,
    homeTeamLogo: normalizeStreamedBadge(match.teams?.home?.badge),
    awayTeamLogo: normalizeStreamedBadge(match.teams?.away?.badge),
    tournament: match.category,
    start: formatStartFromMs(match.date),
    status: getStreamedStatus(match.date),
    provider: "streamed",
    channels,
  };
}

function getChannelId(channel: any): string | null {
  const direct = channel?.channel_id || channel?.id;
  if (direct) return String(direct);
  const fromUrl = String(channel?.url || "").match(/stream-(\d+)\.php/i)?.[1];
  return fromUrl || null;
}

function buildDlStreamUrl(channelId: string): string {
  return `${DLSTREAMS_BASE}/stream/stream-${channelId}.php`;
}

function normalizeCdnChannel(channel: any, index: number): StreamChannel | null {
  const name = String(channel?.channel_name || channel?.name || channel?.channel_code || "").trim();
  if (!name) return null;

  const channelId = getChannelId(channel);
  const directUrl = typeof channel?.url === "string" ? channel.url : "";
  const streamUrl = channelId
    ? buildDlStreamUrl(channelId)
    : directUrl
      ? directUrl.startsWith("/")
        ? `${DLSTREAMS_BASE}${directUrl}`
        : directUrl
      : undefined;

  return {
    id: channelId || `cdn-channel-${index}-${slugify(name)}`,
    name,
    logoUrl: normalizeLogo(channel?.logo_url || channel?.image),
    streamUrl,
    source: String(channel?.channel_code || channel?.channel_name || "cdn-live"),
    provider: "cdn-live",
  };
}

function getCdnEventTitle(event: any): string {
  if (event?.homeTeam && event?.awayTeam) return `${event.homeTeam} vs ${event.awayTeam}`;
  if (event?.event) return String(event.event);
  if (event?.title) return String(event.title);
  return "Live Event";
}

function extractCdnEvents(payload: any): any[] {
  const root = payload?.["cdn-live-tv"] || payload;
  if (!root) return [];
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(root?.events)) return root.events;

  if (typeof root === "object") {
    const events: any[] = [];
    for (const [key, value] of Object.entries(root)) {
      if (["total_events", "cached", "timestamp", "status", "message"].includes(key)) continue;
      if (Array.isArray(value)) {
        events.push(...value);
      }
    }
    return events;
  }

  return [];
}

function normalizeCdnEvent(event: any, index: number): StreamEvent {
  const channelsRaw = Array.isArray(event?.channels) ? event.channels : [];
  const channels = channelsRaw
    .map((channel: any, chIdx: number) => normalizeCdnChannel(channel, chIdx))
    .filter((channel: StreamChannel | null): channel is StreamChannel => Boolean(channel));

  const homeScore =
    toScoreString(event?.homeScore) ||
    toScoreString(event?.home_score) ||
    toScoreString(event?.score?.home) ||
    toScoreString(event?.score_home);

  const awayScore =
    toScoreString(event?.awayScore) ||
    toScoreString(event?.away_score) ||
    toScoreString(event?.score?.away) ||
    toScoreString(event?.score_away);

  const title = getCdnEventTitle(event);
  const fallbackId = slugify([title, event?.tournament, event?.country, event?.start, String(index)].join("-"));

  return {
    id: `cdn-${String(event?.gameID || event?.id || fallbackId || index)}`,
    title,
    homeTeam: toScoreString(event?.homeTeam),
    awayTeam: toScoreString(event?.awayTeam),
    homeTeamLogo: normalizeLogo(event?.homeTeamIMG || event?.homeTeamImg || event?.teams?.home?.logo),
    awayTeamLogo: normalizeLogo(event?.awayTeamIMG || event?.awayTeamImg || event?.teams?.away?.logo),
    homeScore,
    awayScore,
    tournament: toScoreString(event?.tournament),
    country: toScoreString(event?.country),
    status: toScoreString(event?.status),
    start: toScoreString(event?.start),
    provider: "cdn-live",
    channels,
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: 30 },
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchStreamedEvents(requestedSport: string): Promise<StreamEvent[]> {
  const streamedSport = STREAMED_SPORT_MAP[requestedSport];
  if (!streamedSport) return [];

  const matches = await fetchJson<StreamedMatch[]>(`https://streamed.pk/api/matches/${streamedSport}`);
  if (!Array.isArray(matches) || !matches.length) return [];

  const selectedMatches = matches.slice(0, MAX_MATCHES);
  const normalizedEvents = await Promise.all(
    selectedMatches.map(async (match) => {
      const sources = (Array.isArray(match.sources) ? match.sources : []).slice(0, MAX_SOURCES_PER_MATCH);
      const sourceStreams = await Promise.all(
        sources.map(async (source) => {
          const streams = await fetchJson<StreamedStream[]>(
            `https://streamed.pk/api/stream/${encodeURIComponent(source.source)}/${encodeURIComponent(source.id)}`
          );
          if (!Array.isArray(streams)) return [] as StreamChannel[];

          return streams
            .filter((stream) => Boolean(stream?.embedUrl))
            .slice(0, MAX_STREAMS_PER_SOURCE)
            .map((stream, streamIndex) => ({
              id: `streamed-${match.id}-${source.source}-${stream.id || "stream"}-${stream.streamNo ?? streamIndex}-${streamIndex}`,
              name: `#${stream.streamNo ?? streamIndex + 1}${stream.language ? ` ${stream.language}` : ""}${
                stream.hd ? " HD" : ""
              }`,
              streamUrl: stream.embedUrl,
              source: source.source,
              provider: "streamed" as const,
            }));
        })
      );

      const channels = sourceStreams.flat();
      return normalizeStreamedEvent(match, channels);
    })
  );

  return normalizedEvents;
}

async function fetchCdnFallbackEvents(requestedSport: string): Promise<StreamEvent[]> {
  const cdnSport = CDNLIVE_SPORT_MAP[requestedSport];
  if (!cdnSport) return [];

  const url = `${CDNLIVE_BASE}/${encodeURIComponent(cdnSport)}/?user=${encodeURIComponent(
    CDNLIVE_USER
  )}&plan=${encodeURIComponent(CDNLIVE_PLAN)}`;

  const payload = await fetchJson<any>(url);
  if (!payload) return [];

  return extractCdnEvents(payload)
    .slice(0, MAX_MATCHES)
    .map((event: any, index: number) => normalizeCdnEvent(event, index));
}

export async function GET(request: NextRequest) {
  const requestedSport = (request.nextUrl.searchParams.get("sport") || "").toLowerCase();
  const hasStreamedMap = Boolean(STREAMED_SPORT_MAP[requestedSport]);
  const hasCdnMap = Boolean(CDNLIVE_SPORT_MAP[requestedSport]);

  if (!requestedSport || (!hasStreamedMap && !hasCdnMap)) {
    return NextResponse.json(
      {
        available: false,
        sport: requestedSport || "",
        events: [],
        providers: [],
        reason: "Unsupported or missing sport.",
      } satisfies SportStreamsResponse,
      { status: 400 }
    );
  }

  const streamedEvents = await fetchStreamedEvents(requestedSport);
  if (streamedEvents.length > 0) {
    return NextResponse.json({
      available: streamedEvents.some((event) => event.channels.length > 0),
      sport: requestedSport,
      events: streamedEvents,
      providers: ["streamed"],
      reason: undefined,
    } satisfies SportStreamsResponse);
  }

  const cdnEvents = await fetchCdnFallbackEvents(requestedSport);
  return NextResponse.json({
    available: cdnEvents.some((event) => event.channels.length > 0),
    sport: requestedSport,
    events: cdnEvents,
    providers: cdnEvents.length > 0 ? ["cdn-live"] : [],
    reason: cdnEvents.length > 0
      ? "Using CDN fallback because Streamed returned no events."
      : "No live stream events are available right now. Please check back soon.",
  } satisfies SportStreamsResponse);
}
