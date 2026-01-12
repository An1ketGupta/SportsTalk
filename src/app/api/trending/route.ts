import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Get trending sports based on post count
export async function GET(req: NextRequest) {
  try {
    // Group posts by sport and count them
    const sportCounts = await prisma.post.groupBy({
      by: ["sport"],
      where: {
        sport: { not: null },
      },
      _count: {
        sport: true,
      },
      orderBy: {
        _count: {
          sport: "desc",
        },
      },
      take: 5,
    });

    const trends = sportCounts
      .filter((item) => item.sport !== null)
      .map((item) => ({
        sport: item.sport!,
        postCount: item._count.sport,
      }));

    return NextResponse.json({ trends });
  } catch (error) {
    console.error("Trending API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
