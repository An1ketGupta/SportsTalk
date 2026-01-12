import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Simple dev-only seeding endpoint to create demo users + 50 posts
export async function POST(_req: NextRequest) {
  try {
    // If there are already posts, don't re-seed to avoid duplicates
    const existingCount = await prisma.post.count();
    if (existingCount >= 50) {
      return NextResponse.json({
        message: "Seed skipped: 50 or more posts already exist",
        postCount: existingCount,
      });
    }

    // Ensure we have some authors
    let authors = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "asc" },
    });

    if (authors.length === 0) {
      const created = await prisma.user.createMany({
        data: [
          {
            name: "Sports Caster",
            email: "sportscaster@example.com",
            image:
              "https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?q=80&w=600&auto=format&fit=crop",
          },
          {
            name: "NBA Insider",
            email: "nba_insider@example.com",
            image:
              "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop",
          },
          {
            name: "Tennis News",
            email: "tennis_news@example.com",
            image:
              "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop",
          },
          {
            name: "Cricket Analyst",
            email: "cricket_analyst@example.com",
            image:
              "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600&auto=format&fit=crop",
          },
          {
            name: "F1 Reporter",
            email: "f1_reporter@example.com",
            image:
              "https://images.unsplash.com/photo-1619785292559-a15caa28bde6?q=80&w=600&auto=format&fit=crop",
          },
        ],
        skipDuplicates: true,
      });

      if (created.count > 0) {
        authors = await prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: "asc" },
        });
      }
    }

    if (authors.length === 0) {
      return NextResponse.json(
        { message: "No authors available to create posts" },
        { status: 500 }
      );
    }

    const sports = [
      "football",
      "basketball",
      "tennis",
      "cricket",
      "f1",
      "nfl",
      "mma",
      "hockey",
    ];

    const contents = [
      "What a finish! Absolute thriller in the last minute.",
      "This has to be one of the best performances of the season.",
      "Do you think this team can go all the way this year?",
      "Coach’s tactics today were on another level.",
      "Referee decisions were questionable, but what a game overall!",
      "Crowd atmosphere was electric from start to finish.",
      "That clutch play is going straight into the highlight reels.",
      "Injuries are starting to pile up — this could change everything.",
      "Defense wins championships, and today proved it again.",
      "Underdogs are cooking this season. Loving the chaos.",
    ];

    const mediaUrls = [
      "https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1619785292559-a15caa28bde6?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578432014316-48b448d14d57?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544621678-a0ea36c48f2a?q=80&w=1000&auto=format&fit=crop",
    ];

    const now = Date.now();
    const data = Array.from({ length: 50 }).map((_, index) => {
      const author = authors[index % authors.length];
      const sport = sports[index % sports.length];
      const content =
        contents[(index + Math.floor(index / 3)) % contents.length];
      const mediaUrl =
        index % 3 === 0 ? mediaUrls[index % mediaUrls.length] : null;

      return {
        content: `[${sport.toUpperCase()}] ${content}`,
        mediaUrl,
        sport,
        authorId: author.id,
        createdAt: new Date(now - index * 10 * 60 * 1000), // every 10 minutes in the past
      };
    });

    await prisma.post.createMany({
      data,
    });

    const finalCount = await prisma.post.count();

    return NextResponse.json({
      message: "Seeded 50 demo posts successfully",
      postCount: finalCount,
    });
  } catch (error) {
    console.error("Seed posts error:", error);
    return NextResponse.json(
      { message: "Failed to seed posts" },
      { status: 500 }
    );
  }
}


