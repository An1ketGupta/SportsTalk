/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

type Provider = "cdn-live" | "streamed" | "none";

interface MatchContext {
  sport: string;
  home?: string;
  away?: string;
  event?: string;
  start?: string;
}

interface WatchOption {
  id: string;
  label: string;
  url: string;
  logoUrl?: string;
  quality?: string;
  language?: string;
  source: string;
  provider: Provider;
}

interface ManualCandidate {
  eventId: string;
  title: string;
  start?: string;
  channels: WatchOption[];
}

interface WatchOptionsResponse {
  available: boolean;
  provider: Provider;
  matchContext: MatchContext;
  options: WatchOption[];
  manualCandidates?: ManualCandidate[];
  reason?: string;
}

const DLSTREAMS_BASE = "https://dlstreams.top";
const CDNLIVE_BASE = "https://api.cdn-live.tv/api/v1/events/sports";
const CDNLIVE_USER = process.env.CDNLIVE_USER || "cdnlivetv";
const CDNLIVE_PLAN = process.env.CDNLIVE_PLAN || "free";
const LOW_CONFIDENCE_SCORE = 5;
const HIGH_CONFIDENCE_SCORE = 8;

const matchIdSportMap: Record<string, string> = {
  fo: "soccer",
  nb: "nba",
  bb: "basketball",
  nf: "nfl",
  ho: "hockey",
  tn: "tennis",
  cr: "cricket",
  mm: "mma",
  f1: "motorsport",
};

const streamedSportMap: Record<string, string> = {
  soccer: "football",
  basketball: "basketball",
  nba: "basketball",
  tennis: "tennis",
  hockey: "hockey",
  mma: "mma",
};

const playableFolders = ["stream", "cast", "watch", "plus", "casting", "player"];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(fc|cf|sc|afc|ac|club|the|team)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2);
}

function tokenOverlap(haystack: string, needle: string): number {
  const tokens = tokenize(needle);
  if (!tokens.length) return 0;
  let matches = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) matches += 1;
  }
  return matches / tokens.length;
}

function parseDateLike(value?: string | number | null): Date | null {
  if (!value && value !== 0) return null;
  if (typeof value === "number") {
    const isSeconds = value < 10_000_000_000;
    const date = new Date(isSeconds ? value * 1000 : value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const date = new Date(raw.replace(" ", "T"));
  if (!Number.isNaN(date.getTime())) return date;
  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function timeScore(contextStart?: string, eventStart?: string): number {
  const left = parseDateLike(contextStart);
  const right = parseDateLike(eventStart);
  if (!left || !right) return 0;
  const diff = Math.abs(left.getTime() - right.getTime()) / 60000;
  if (diff <= 30) return 3;
  if (diff <= 90) return 2;
  if (diff <= 240) return 1;
  return 0;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, init);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchApiSports(url: string, host: string): Promise<any | null> {
  return fetchJson<any>(url, {
    method: "GET",
    headers: {
      "x-rapidapi-host": host,
      "x-rapidapi-key": process.env.RAPIDAPI_SPORTS_KEY || "",
    },
    next: { revalidate: 20 },
  });
}

async function fetchTennis(url: string): Promise<any | null> {
  return fetchJson<any>(url, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "tennisapi1.p.rapidapi.com",
      "x-rapidapi-key": process.env.RAPIDAPI_TENNIS_KEY || "",
    },
    next: { revalidate: 20 },
  });
}

async function fetchCricket(url: string, endpoint: string): Promise<any | null> {
  return fetchJson<any>(url, {
    method: "GET",
    headers: {
      "x-apihub-host": "Cricbuzz-Official-Cricket-API.allthingsdev.co",
      "x-apihub-key": process.env.CRICKET_API_KEY || "",
      "x-apihub-endpoint": endpoint,
    },
    next: { revalidate: 20 },
  });
}

function normalizeLogo(logo?: string): string | undefined {
  if (!logo) return undefined;
  if (/^https?:\/\//i.test(logo)) return logo;
  return `${DLSTREAMS_BASE}/${logo.replace(/^\//, "")}`;
}

function getChannelId(channel: any): string | null {
  const direct = channel?.channel_id || channel?.id;
  if (direct) return String(direct);

  const fromUrl = String(channel?.url || "").match(/stream-(\d+)\.php/i)?.[1];
  if (fromUrl) return fromUrl;

  return null;
}

function buildPlayableUrl(channelId: string, folder = "stream"): string {
  return `${DLSTREAMS_BASE}/${folder}/stream-${channelId}.php`;
}

function getEventTitle(event: any): string {
  if (event?.homeTeam && event?.awayTeam) {
    return `${event.homeTeam} vs ${event.awayTeam}`;
  }
  if (event?.event) return String(event.event);
  return String(event?.tournament || "Event");
}

function scoreCdnEvent(event: any, context: MatchContext): number {
  const eventTitle = getEventTitle(event);
  const eventHome = event?.homeTeam || "";
  const eventAway = event?.awayTeam || "";
  const searchable = normalizeText(
    [
      eventTitle,
      eventHome,
      eventAway,
      event?.tournament || "",
      event?.country || "",
    ].join(" ")
  );

  let score = 0;
  if (context.home) {
    const homeNorm = normalizeText(context.home);
    if (homeNorm && searchable.includes(homeNorm)) score += 3;
    score += tokenOverlap(searchable, context.home) * 2;
  }
  if (context.away) {
    const awayNorm = normalizeText(context.away);
    if (awayNorm && searchable.includes(awayNorm)) score += 3;
    score += tokenOverlap(searchable, context.away) * 2;
  }
  if (context.event) {
    score += tokenOverlap(searchable, context.event) * 1.5;
  }

  score += timeScore(context.start, event?.start);

  const status = normalizeText(String(event?.status || ""));
  if (status.includes("live")) score += 1.5;

  return score;
}

function createCdnOption(channel: any, event: any, idx: number): WatchOption | null {
  const channelId = getChannelId(channel);
  const label = String(channel?.channel_name || channel?.name || channel?.channel_code || `Channel ${idx + 1}`);
  const source = String(channel?.channel_code || channel?.channel_name || "cdn-live");
  const logoUrl = normalizeLogo(channel?.logo_url || channel?.image);

  let url = "";
  if (channelId) {
    url = buildPlayableUrl(channelId, "stream");
  } else if (typeof channel?.url === "string" && channel.url) {
    url = channel.url.startsWith("/") ? `${DLSTREAMS_BASE}${channel.url}` : channel.url;
  }

  if (!url) return null;

  return {
    id: `cdn-${event?.gameID || event?.id || "event"}-${channelId || source}-${idx}`,
    label,
    url,
    logoUrl,
    source,
    quality: channel?.quality,
    language: channel?.language,
    provider: "cdn-live",
  };
}

function normalizeCdnChannels(event: any): WatchOption[] {
  const channels = Array.isArray(event?.channels) ? event.channels : [];
  const options = channels
    .map((channel: any, idx: number) => createCdnOption(channel, event, idx))
    .filter((item: WatchOption | null): item is WatchOption => Boolean(item));

  // Include quick failover options when we have channel IDs.
  const expanded: WatchOption[] = [];
  for (const option of options) {
    expanded.push(option);
    const channelId = option.url.match(/stream-(\d+)\.php/i)?.[1];
    if (!channelId) continue;
    for (const folder of playableFolders.slice(1, 3)) {
      expanded.push({
        ...option,
        id: `${option.id}-${folder}`,
        label: `${option.label} (${folder})`,
        source: `${option.source}:${folder}`,
        url: buildPlayableUrl(channelId, folder),
      });
    }
  }

  return expanded;
}

async function resolveMatchContextFromId(matchId: string): Promise<MatchContext | null> {
  const prefix = matchId.slice(0, 2).toLowerCase();
  const rawId = matchId.slice(2);
  if (!rawId) return null;

  if (prefix === "fo") {
    const json = await fetchApiSports(`https://v3.football.api-sports.io/fixtures?id=${rawId}`, "v3.football.api-sports.io");
    const fixture = Array.isArray(json?.response) ? json.response[0] : null;
    if (!fixture) return null;
    const home = fixture?.teams?.home?.name;
    const away = fixture?.teams?.away?.name;
    return { sport: "soccer", home, away, event: home && away ? `${home} vs ${away}` : undefined, start: fixture?.fixture?.date };
  }

  if (prefix === "nb") {
    const json = await fetchApiSports(`https://v2.nba.api-sports.io/games?id=${rawId}`, "v2.nba.api-sports.io");
    const game = Array.isArray(json?.response) ? json.response[0] : null;
    if (!game) return null;
    const home = game?.teams?.home?.name;
    const away = game?.teams?.visitors?.name;
    return { sport: "nba", home, away, event: home && away ? `${home} vs ${away}` : undefined, start: game?.date?.start };
  }

  if (prefix === "bb") {
    const json = await fetchApiSports(`https://v1.basketball.api-sports.io/games?id=${rawId}`, "v1.basketball.api-sports.io");
    const game = Array.isArray(json?.response) ? json.response[0] : null;
    if (!game) return null;
    const home = game?.teams?.home?.name;
    const away = game?.teams?.away?.name;
    return { sport: "basketball", home, away, event: home && away ? `${home} vs ${away}` : undefined, start: game?.date };
  }

  if (prefix === "nf") {
    const json = await fetchApiSports(`https://v1.american-football.api-sports.io/games?id=${rawId}`, "v1.american-football.api-sports.io");
    const gameWrapper = Array.isArray(json?.response) ? json.response[0] : null;
    const game = gameWrapper?.game;
    const teams = gameWrapper?.teams;
    if (!game || !teams) return null;
    const home = teams?.home?.name;
    const away = teams?.away?.name;
    return { sport: "nfl", home, away, event: home && away ? `${home} vs ${away}` : undefined, start: game?.date };
  }

  if (prefix === "ho") {
    const json = await fetchApiSports(`https://v1.hockey.api-sports.io/games?id=${rawId}`, "v1.hockey.api-sports.io");
    const game = Array.isArray(json?.response) ? json.response[0] : null;
    if (!game) return null;
    const home = game?.teams?.home?.name;
    const away = game?.teams?.away?.name;
    return { sport: "hockey", home, away, event: home && away ? `${home} vs ${away}` : undefined, start: game?.date };
  }

  if (prefix === "tn") {
    const json = await fetchTennis(`https://tennisapi1.p.rapidapi.com/api/tennis/event/${rawId}`);
    const event = json?.event;
    if (!event) return null;
    const home = event?.homeTeam?.name || event?.homeTeam?.shortName;
    const away = event?.awayTeam?.name || event?.awayTeam?.shortName;
    const startTs = event?.startTimestamp ? new Date(Number(event.startTimestamp) * 1000).toISOString() : undefined;
    return { sport: "tennis", home, away, event: event?.tournament?.name || (home && away ? `${home} vs ${away}` : undefined), start: startTs };
  }

  if (prefix === "cr") {
    const json = await fetchCricket(
      `https://Cricbuzz-Official-Cricket-API.proxy-production.allthingsdev.co/match/${rawId}`,
      "ac951751-d311-4d23-8f18-353e75432353"
    );
    if (!json) return null;
    const home = json?.team1?.teamname || json?.team1?.teamsname;
    const away = json?.team2?.teamname || json?.team2?.teamsname;
    const startDate = json?.startdate || json?.startDate;
    return {
      sport: "cricket",
      home,
      away,
      event: json?.seriesname || (home && away ? `${home} vs ${away}` : undefined),
      start: startDate ? String(startDate) : undefined,
    };
  }

  if (prefix === "mm") {
    const json = await fetchApiSports(`https://v1.mma.api-sports.io/fights?id=${rawId}`, "v1.mma.api-sports.io");
    const fight = Array.isArray(json?.response) ? json.response[0] : null;
    if (!fight) return null;
    const home = fight?.fighters?.first?.name;
    const away = fight?.fighters?.second?.name;
    return { sport: "mma", home, away, event: fight?.slug || (home && away ? `${home} vs ${away}` : undefined), start: fight?.date };
  }

  if (prefix === "f1") {
    const json = await fetchApiSports(`https://v1.formula-1.api-sports.io/races?id=${rawId}`, "v1.formula-1.api-sports.io");
    const race = Array.isArray(json?.response) ? json.response[0] : null;
    if (!race) return null;
    return {
      sport: "motorsport",
      event: race?.competition?.name || race?.type || race?.circuit?.name,
      start: race?.date,
    };
  }

  return null;
}

function buildSearchableForStreamed(match: any): string {
  return normalizeText(
    [
      match?.title || "",
      match?.teams?.home?.name || "",
      match?.teams?.away?.name || "",
      match?.category || "",
    ].join(" ")
  );
}

function scoreStreamedMatch(match: any, context: MatchContext): number {
  const searchable = buildSearchableForStreamed(match);
  let score = 0;
  if (context.home) {
    if (searchable.includes(normalizeText(context.home))) score += 4;
    score += tokenOverlap(searchable, context.home) * 2;
  }
  if (context.away) {
    if (searchable.includes(normalizeText(context.away))) score += 4;
    score += tokenOverlap(searchable, context.away) * 2;
  }
  if (context.event) {
    score += tokenOverlap(searchable, context.event) * 1.5;
  }
  return score;
}

async function getStreamedFallback(context: MatchContext): Promise<WatchOption[]> {
  const streamedSport = streamedSportMap[context.sport];
  if (!streamedSport || !context.home || !context.away) return [];

  const matches = await fetchJson<any[]>(`https://streamed.pk/api/matches/${streamedSport}`);
  if (!Array.isArray(matches) || !matches.length) return [];

  let bestMatch: any = null;
  let bestScore = -1;
  for (const match of matches) {
    const score = scoreStreamedMatch(match, context);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = match;
    }
  }

  if (!bestMatch || bestScore < 5) return [];

  const options: WatchOption[] = [];
  for (const source of bestMatch?.sources || []) {
    const streams = await fetchJson<any[]>(
      `https://streamed.pk/api/stream/${encodeURIComponent(source.source)}/${encodeURIComponent(source.id)}`
    );
    if (!Array.isArray(streams)) continue;
    for (const stream of streams) {
      if (!stream?.embedUrl) continue;
      options.push({
        id: `streamed-${source.source}-${stream.id || stream.streamNo}`,
        label: `Stream ${stream.streamNo ?? "1"}${stream.hd ? " HD" : ""}${stream.language ? ` (${stream.language})` : ""}`,
        url: stream.embedUrl,
        source: source.source,
        quality: stream.hd ? "HD" : "SD",
        language: stream.language,
        provider: "streamed",
      });
    }
  }

  return options;
}

function extractCdnEvents(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.events)) return payload.events;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

export async function GET(request: NextRequest) {
  const matchId = request.nextUrl.searchParams.get("matchId") || "";
  if (!matchId) {
    return NextResponse.json(
      {
        available: false,
        provider: "none",
        matchContext: { sport: "" },
        options: [],
        reason: "Missing required query param: matchId",
      } satisfies WatchOptionsResponse,
      { status: 400 }
    );
  }

  const requestedSport = request.nextUrl.searchParams.get("sport") || undefined;
  const requestedHome = request.nextUrl.searchParams.get("home") || undefined;
  const requestedAway = request.nextUrl.searchParams.get("away") || undefined;
  const requestedStart = request.nextUrl.searchParams.get("start") || undefined;

  const resolvedContext = await resolveMatchContextFromId(matchId);
  const fallbackSport = matchIdSportMap[matchId.slice(0, 2).toLowerCase()];
  const context: MatchContext = {
    sport: requestedSport || resolvedContext?.sport || fallbackSport || "",
    home: requestedHome || resolvedContext?.home,
    away: requestedAway || resolvedContext?.away,
    event: resolvedContext?.event,
    start: requestedStart || resolvedContext?.start,
  };

  if (!context.sport) {
    const payload: WatchOptionsResponse = {
      available: false,
      provider: "none",
      matchContext: context,
      options: [],
      reason: "Could not resolve sport for this match.",
    };
    return NextResponse.json(payload);
  }

  const cdnUrl = `${CDNLIVE_BASE}/${encodeURIComponent(context.sport)}/?user=${encodeURIComponent(
    CDNLIVE_USER
  )}&plan=${encodeURIComponent(CDNLIVE_PLAN)}`;
  const cdnPayload = await fetchJson<any>(cdnUrl, { next: { revalidate: 20 } });
  const cdnEvents = extractCdnEvents(cdnPayload);

  const scored = cdnEvents
    .map((event) => ({ event, score: scoreCdnEvent(event, context) }))
    .sort((a, b) => b.score - a.score);

  if (scored.length && scored[0].score >= HIGH_CONFIDENCE_SCORE) {
    const selectedEvent = scored[0].event;
    const options = normalizeCdnChannels(selectedEvent);
    if (options.length) {
      const payload: WatchOptionsResponse = {
        available: true,
        provider: "cdn-live",
        matchContext: context,
        options,
      };
      return NextResponse.json(payload);
    }
  }

  if (scored.length && scored[0].score >= LOW_CONFIDENCE_SCORE) {
    const manualCandidates: ManualCandidate[] = scored.slice(0, 3).map(({ event }) => ({
      eventId: String(event?.gameID || event?.id || event?.event || Math.random()),
      title: getEventTitle(event),
      start: event?.start,
      channels: normalizeCdnChannels(event),
    }));

    const payload: WatchOptionsResponse = {
      available: false,
      provider: "cdn-live",
      matchContext: context,
      options: [],
      manualCandidates: manualCandidates.filter((candidate) => candidate.channels.length > 0),
      reason: "Low confidence match. Please select from likely events.",
    };
    return NextResponse.json(payload);
  }

  const streamedOptions = await getStreamedFallback(context);
  if (streamedOptions.length) {
    const payload: WatchOptionsResponse = {
      available: true,
      provider: "streamed",
      matchContext: context,
      options: streamedOptions,
      reason: "Using fallback stream provider.",
    };
    return NextResponse.json(payload);
  }

  const payload: WatchOptionsResponse = {
    available: false,
    provider: "none",
    matchContext: context,
    options: [],
    reason: "No live stream options found for this match right now.",
  };
  return NextResponse.json(payload);
}
