import { auth } from "@/auth";
import prisma from "@/lib/db";
import {
  getFollowingLiveWatchEntries,
  removeLiveWatchEntry,
  upsertLiveWatchEntry,
} from "@/lib/liveWatchPresence";
import { NextRequest, NextResponse } from "next/server";

function normalizeSport(sport: string): string {
  return sport.trim().toLowerCase().replace(/\s+/g, "_");
}

function normalizeEventTitle(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ watching: [] });
    }

    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const entries = getFollowingLiveWatchEntries(following.map((item) => item.followingId));
    return NextResponse.json({
      watching: entries,
    });
  } catch (error) {
    console.error("watch-presence GET error:", error);
    return NextResponse.json({ watching: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      sport?: string;
      eventId?: string;
      eventTitle?: string;
    };

    const sport = normalizeSport(body.sport || "");
    const eventId = (body.eventId || "").trim();
    const eventTitle = normalizeEventTitle(body.eventTitle || "");
    if (!sport || !eventId || !eventTitle) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const watchPath = `/livematches/watch?sport=${encodeURIComponent(sport)}&eventId=${encodeURIComponent(eventId)}`;
    upsertLiveWatchEntry({
      userId,
      userName: session.user?.name || session.user?.email?.split("@")[0] || "User",
      userImage: session.user?.image || undefined,
      sport,
      eventId,
      eventTitle,
      watchPath,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("watch-presence POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ ok: true });
    }

    removeLiveWatchEntry(userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("watch-presence DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
