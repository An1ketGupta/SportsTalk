/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

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

const DLSTREAMS_BASE = "https://dlstreams.top";
const CDNLIVE_USER = process.env.CDNLIVE_USER || "cdnlivetv";
const CDNLIVE_PLAN = process.env.CDNLIVE_PLAN || "free";

function normalizeLogo(logo?: string): string | undefined {
  if (!logo) return undefined;
  if (/^https?:\/\//i.test(logo)) return logo;
  return `${DLSTREAMS_BASE}/${logo.replace(/^\//, "")}`;
}

function buildStreamUrlFromId(id: string): string {
  return `${DLSTREAMS_BASE}/stream/stream-${id}.php`;
}

function mapChannel(raw: any, index: number): LiveChannel | null {
  const idRaw = raw?.channel_id || raw?.id || raw?.channelId;
  const name = String(raw?.channel_name || raw?.name || raw?.channel_code || "").trim();
  if (!name) return null;

  const id = idRaw ? String(idRaw) : `channel-${index}`;
  const streamUrl =
    raw?.url && typeof raw.url === "string"
      ? raw.url.startsWith("/")
        ? `${DLSTREAMS_BASE}${raw.url}`
        : raw.url
      : idRaw
        ? buildStreamUrlFromId(String(idRaw))
        : undefined;

  return {
    id,
    name,
    code: raw?.channel_code ? String(raw.channel_code) : undefined,
    logoUrl: normalizeLogo(raw?.logo_url || raw?.image),
    streamUrl,
  };
}

function extractChannels(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.channels)) return payload.channels;
  if (Array.isArray(payload?.["cdn-live-tv"]?.channels)) return payload["cdn-live-tv"].channels;
  return [];
}

export async function GET() {
  const url = `https://api.cdn-live.tv/api/v1/channels/?user=${encodeURIComponent(
    CDNLIVE_USER
  )}&plan=${encodeURIComponent(CDNLIVE_PLAN)}`;

  try {
    const response = await fetch(url, { next: { revalidate: 120 } });
    if (!response.ok) {
      return NextResponse.json(
        {
          available: false,
          channels: [],
          reason: `Channels API returned ${response.status}`,
        } satisfies LiveChannelsResponse,
        { status: 200 }
      );
    }

    const payload = await response.json();
    const rawChannels = extractChannels(payload);
    const channels = rawChannels
      .map((item, index) => mapChannel(item, index))
      .filter((item): item is LiveChannel => Boolean(item))
      .slice(0, 200);

    return NextResponse.json({
      available: channels.length > 0,
      channels,
      reason: channels.length ? undefined : "No channels available right now.",
    } satisfies LiveChannelsResponse);
  } catch {
    return NextResponse.json({
      available: false,
      channels: [],
      reason: "Could not load live channels right now.",
    } satisfies LiveChannelsResponse);
  }
}
