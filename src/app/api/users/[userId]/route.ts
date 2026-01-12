import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    userId: string;
  }>;
};

// Get user profile with posts
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: {
          include: {
            likes: {
              where: currentUserId
                ? { userId: currentUserId }
                : undefined,
              select: { userId: true },
            },
            _count: {
              select: { likes: true, comments: true },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
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
      posts: user.posts.map((p) => ({
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
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
