import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") === "following" ? "following" : "foryou";

    if (!user?.id) {
      // For unauthenticated users, only For You feed makes sense
      if (type === "following") {
        return NextResponse.json({ posts: [], followingCount: 0 });
      }
    }

    if (type === "following" && user?.id) {
      const followingRelations = await prisma.userFollow.findMany({
        where: { followerId: user.id as string },
        select: { followingId: true },
      });

      const followingIds = followingRelations.map((f) => f.followingId);

      if (followingIds.length === 0) {
        return NextResponse.json({ posts: [], followingCount: 0 });
      }

      const posts = await prisma.post.findMany({
        where: {
          authorId: { in: followingIds },
        },
        include: {
          author: true,
          likes: {
            where: user?.id ? { userId: user.id as string } : undefined,
            select: { userId: true },
          },
          _count: {
            select: { likes: true, comments: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
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
          },
          likeCount: p._count.likes,
          commentCount: p._count.comments,
          isLiked: p.likes.length > 0,
        })),
        followingCount: followingIds.length,
      });
    }

    // For You feed = all posts from all users
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        likes: {
          where: user?.id ? { userId: user.id as string } : undefined,
          select: { userId: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
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
        },
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        isLiked: p.likes.length > 0,
      })),
    });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


