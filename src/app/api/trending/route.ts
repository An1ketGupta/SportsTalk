import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const postsWithTags = await prisma.post.findMany({
      where: {
        sport: { not: null },
      },
      select: {
        sport: true,
      },
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
      .slice(0, 5); // Top 10 trending tags

    return NextResponse.json({ trends });
  } catch (error) {
    console.error("Trending API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
