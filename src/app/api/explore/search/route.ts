import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Search posts and users
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ posts: [], users: [] });
    }

    // Search posts
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { content: { contains: query, mode: "insensitive" } },
          { sport: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        author: true,
        likes: {
          where: currentUserId ? { userId: currentUserId } : undefined,
          select: { userId: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    // Search users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        isVerified: true,
        _count: {
          select: { followers: true },
        },
      },
      take: 10,
    });

    return NextResponse.json({
      posts: posts.map((p) => ({
        id: p.id,
        content: p.content,
        createdAt: p.createdAt,
        mediaUrl: p.mediaUrl,
        sport: p.sport,
        author: {
          id: p.author.id,
          name: p.author.name,
          image: p.author.image,
          username: p.author.email?.split("@")[0] ?? "user",
          isVerified: p.author.isVerified,
        },
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        isLiked: p.likes.length > 0,
      })),
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.email?.split("@")[0] ?? "user",
        image: u.image,
        bio: u.bio,
        isVerified: u.isVerified,
        followerCount: u._count.followers,
      })),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
