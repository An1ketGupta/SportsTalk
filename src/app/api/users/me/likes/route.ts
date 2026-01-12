import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Get posts that the current user has liked
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const cursor = searchParams.get("cursor");

    const likes = await prisma.like.findMany({
      where: {
        userId: currentUserId,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      take: limit + 1,
      include: {
        post: {
          include: {
            author: true,
            _count: {
              select: { likes: true, comments: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const hasMore = likes.length > limit;
    const likesToReturn = hasMore ? likes.slice(0, limit) : likes;
    const nextCursor = hasMore
      ? likesToReturn[likesToReturn.length - 1].createdAt.toISOString()
      : null;

    return NextResponse.json({
      posts: likesToReturn.map((like) => ({
        id: like.post.id,
        content: like.post.content,
        createdAt: like.post.createdAt,
        mediaUrl: like.post.mediaUrl,
        sport: like.post.sport,
        author: {
          id: like.post.author.id,
          name: like.post.author.name,
          image: like.post.author.image,
          username: like.post.author.email?.split("@")[0] ?? "user",
        },
        likeCount: like.post._count.likes,
        commentCount: like.post._count.comments,
        isLiked: true, // User has liked these posts
      })),
      nextCursor,
    });
  } catch (error) {
    console.error("Get my likes error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
