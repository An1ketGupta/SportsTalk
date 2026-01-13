import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Get current user's replies (comments)
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

    const replies = await prisma.comment.findMany({
      where: {
        authorId: currentUserId,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      take: limit + 1,
      include: {
        author: true,
        post: {
          include: {
            author: true,
            _count: {
              select: { likes: true, comments: true },
            },
            likes: {
              where: { userId: currentUserId },
              select: { userId: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const hasMore = replies.length > limit;
    const repliesToReturn = hasMore ? replies.slice(0, limit) : replies;
    const nextCursor = hasMore
      ? repliesToReturn[repliesToReturn.length - 1].createdAt.toISOString()
      : null;

    return NextResponse.json({
      replies: repliesToReturn.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        author: {
          id: reply.author.id,
          name: reply.author.name,
          image: reply.author.image,
          username: reply.author.email?.split("@")[0] ?? "user",
          isVerified: reply.author.isVerified,
        },
        post: {
          id: reply.post.id,
          content: reply.post.content,
          createdAt: reply.post.createdAt,
          mediaUrl: reply.post.mediaUrl,
          sport: reply.post.sport,
          author: {
            id: reply.post.author.id,
            name: reply.post.author.name,
            image: reply.post.author.image,
            username: reply.post.author.email?.split("@")[0] ?? "user",
            isVerified: reply.post.author.isVerified,
          },
          likeCount: reply.post._count.likes,
          commentCount: reply.post._count.comments,
          isLiked: reply.post.likes.length > 0,
        },
      })),
      nextCursor,
    });
  } catch (error) {
    console.error("Get my replies error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
