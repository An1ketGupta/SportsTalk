import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export const revalidate = 1800; // 30 minutes

export async function GET() {
  try {
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
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error("Trending API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
