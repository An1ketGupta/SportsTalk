import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch posts with tags
    const postsWithTags = await prisma.post.findMany({
      where: { sport: { not: null } },
      select: { sport: true },
    });

    const tagCounts = new Map<string, number>();

    postsWithTags.forEach((post) => {
      if (post.sport) {
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
    console.error("Trending API error:", error);
    // Return empty trends as fallback instead of failing
    return NextResponse.json(
      { trends: [], error: "Failed to fetch trends" },
      {
        status: 200, // Return 200 with empty array instead of 500
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
