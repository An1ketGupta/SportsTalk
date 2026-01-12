import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    userId: string;
  }>;
};

// Get user profile with posts (paginated)
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const cursor = searchParams.get("cursor");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch posts separately with pagination
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      take: limit + 1,
      include: {
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
    });

    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? postsToReturn[postsToReturn.length - 1].createdAt.toISOString() : null;

    // Check if current user is following this user
    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const followRelation = await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!followRelation;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.email?.split("@")[0] ?? "user",
        email: user.email,
        image: user.image,
        bio: user.bio,
        createdAt: user.createdAt,
        followerCount: user._count.followers,
        followingCount: user._count.following,
        postCount: user._count.posts,
        isFollowing,
        isOwnProfile: currentUserId === userId,
      },
      posts: postsToReturn.map((p) => ({
        id: p.id,
        content: p.content,
        createdAt: p.createdAt,
        mediaUrl: p.mediaUrl,
        sport: p.sport,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
          username: user.email?.split("@")[0] ?? "user",
        },
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        isLiked: p.likes.length > 0,
      })),
      nextCursor,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
