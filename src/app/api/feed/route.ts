import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") === "following" ? "following" : "foryou";
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const cursor = searchParams.get("cursor");

    if (!user?.id) {
      // For unauthenticated users, only For You feed makes sense
      if (type === "following") {
        return NextResponse.json({ posts: [], followingCount: 0, nextCursor: null });
      }
    }

    if (type === "following" && user?.id) {
      const followingRelations = await prisma.userFollow.findMany({
        where: { followerId: user.id as string },
        select: { followingId: true },
      });

      const followingIds = followingRelations.map((f) => f.followingId);

      if (followingIds.length === 0) {
        return NextResponse.json({ posts: [], followingCount: 0, nextCursor: null });
      }

      const posts = await prisma.post.findMany({
        where: {
          authorId: { in: followingIds },
          ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
        },
        take: limit + 1, // Fetch one extra to check if there are more
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

      const hasMore = posts.length > limit;
      const postsToReturn = hasMore ? posts.slice(0, limit) : posts;
      const nextCursor = hasMore ? postsToReturn[postsToReturn.length - 1].createdAt.toISOString() : null;

      return NextResponse.json({
        posts: postsToReturn.map((p) => ({
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
        nextCursor,
      });
    }

    // For You feed = all posts from all users
    const posts = await prisma.post.findMany({
      where: cursor ? { createdAt: { lt: new Date(cursor) } } : undefined,
      take: limit + 1,
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

    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? postsToReturn[postsToReturn.length - 1].createdAt.toISOString() : null;

    return NextResponse.json({
      posts: postsToReturn.map((p) => ({
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
      nextCursor,
    });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


