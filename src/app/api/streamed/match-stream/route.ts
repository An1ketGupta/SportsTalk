import { NextRequest, NextResponse } from "next/server";

interface StreamedSource {
  source: string;
  id: string;
}

interface StreamedTeamInfo {
  name: string;
  badge: string;
}

interface StreamedMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  poster?: string;
  popular: boolean;
  teams?: {
    home?: StreamedTeamInfo;
    away?: StreamedTeamInfo;
  };
  sources: StreamedSource[];
}

interface StreamedStream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
}

const ALLOWED_SPORTS = new Set(["football", "basketball", "tennis", "hockey", "mma"]);

function normalizeTeamName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(fc|cf|sc|afc|ac|club|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTokens(value: string): string[] {
  return normalizeTeamName(value)
    .split(" ")
    .filter((token) => token.length > 2);
}

function includesOrTokenMatch(haystack: string, needle: string): boolean {
  if (!needle) return false;
  if (haystack.includes(needle)) return true;

  const needleTokens = getTokens(needle);
  return needleTokens.some((token) => haystack.includes(token));
}

function scoreMatch(match: StreamedMatch, home: string, away: string): number {
  const searchable = normalizeTeamName(
    [
      match.title,
      match.teams?.home?.name || "",
      match.teams?.away?.name || "",
      match.category || "",
    ].join(" ")
  );

  let score = 0;
  if (includesOrTokenMatch(searchable, home)) score += 5;
  if (includesOrTokenMatch(searchable, away)) score += 5;

  const homeTokens = getTokens(home);
  const awayTokens = getTokens(away);
  for (const token of homeTokens) {
    if (searchable.includes(token)) score += 1;
  }
  for (const token of awayTokens) {
    if (searchable.includes(token)) score += 1;
  }

  return score;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      next: { revalidate: 30 },
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const sport = request.nextUrl.searchParams.get("sport")?.toLowerCase();
  const home = request.nextUrl.searchParams.get("home") || "";
  const away = request.nextUrl.searchParams.get("away") || "";

  if (!sport || !home || !away) {
    return NextResponse.json(
      { available: false, reason: "Missing sport/home/away parameters." },
      { status: 400 }
    );
  }

  if (!ALLOWED_SPORTS.has(sport)) {
    return NextResponse.json({
      available: false,
      reason: "Streaming lookup is not configured for this sport yet.",
    });
  }

  const matches = await fetchJson<StreamedMatch[]>(`https://streamed.pk/api/matches/${sport}`);
  if (!Array.isArray(matches) || matches.length === 0) {
    return NextResponse.json({
      available: false,
      reason: "No streamable matches found for this sport right now.",
    });
  }

  let bestMatch: StreamedMatch | null = null;
  let bestScore = -1;

  for (const match of matches) {
    const score = scoreMatch(match, home, away);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = match;
    }
  }

  if (!bestMatch || bestScore < 6) {
    return NextResponse.json({
      available: false,
      reason: "No matching stream found for this specific fixture.",
    });
  }

  for (const source of bestMatch.sources || []) {
    const streams = await fetchJson<StreamedStream[]>(
      `https://streamed.pk/api/stream/${encodeURIComponent(source.source)}/${encodeURIComponent(source.id)}`
    );

    if (Array.isArray(streams) && streams.length > 0) {
      return NextResponse.json({
        available: true,
        match: {
          id: bestMatch.id,
          title: bestMatch.title,
          category: bestMatch.category,
        },
        streams,
      });
    }
  }

  return NextResponse.json({
    available: false,
    match: {
      id: bestMatch.id,
      title: bestMatch.title,
      category: bestMatch.category,
    },
    reason: "Match found, but no active stream links are available right now.",
  });
}

