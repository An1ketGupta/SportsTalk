import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Dynamic import to catch initialization errors (e.g. missing connection string)
    // inside the handler rather than crashing the module
    const dbModule = await import("@/lib/db");
    const prisma = dbModule.prisma || dbModule.default;

    if (!prisma) {
      throw new Error("Prisma client failed to initialize");
    }

    // Fetch posts with tags
    const postsWithTags = await prisma.post.findMany({
      where: { sport: { not: null } },
      select: { sport: true },
    });

    const tagCounts = new Map<string, number>();

    postsWithTags.forEach((post) => {
      // Defensive check for sport
      if (post && typeof post.sport === 'string') {
        const tags = post.sport.split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach((tag) => {
          tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
        });
      }
    });

    const trends = Array.from(tagCounts.entries())
      .map(([tag, postCount]) => ({ tag, postCount }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5);

    return NextResponse.json({ trends }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Trending API detailed error:", error);

    // Construct a safe error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Return empty trends with error details for debugging
    // This ensures client handles it gracefully
    return NextResponse.json(
      {
        trends: [],
        error: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      {
        status: 200, // Still return 200 to prevent client crash
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
