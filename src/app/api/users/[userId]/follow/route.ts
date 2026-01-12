import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    userId: string;
  }>;
};

// Follow/Unfollow a user
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const currentUser = session?.user;

    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: targetUserId } = await params;

    if (currentUser.id === targetUserId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id as string,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.userFollow.delete({
        where: { id: existingFollow.id },
      });

      const followerCount = await prisma.userFollow.count({
        where: { followingId: targetUserId },
      });

      return NextResponse.json({
        message: "Unfollowed successfully",
        isFollowing: false,
        followerCount,
      });
    } else {
      // Follow
      await prisma.userFollow.create({
        data: {
          followerId: currentUser.id as string,
          followingId: targetUserId,
        },
      });

      // Create notification for the followed user
      await prisma.notification.create({
        data: {
          type: "follow",
          userId: targetUserId,
          actorId: currentUser.id as string,
        },
      });

      const followerCount = await prisma.userFollow.count({
        where: { followingId: targetUserId },
      });

      return NextResponse.json({
        message: "Followed successfully",
        isFollowing: true,
        followerCount,
      });
    }
  } catch (error) {
    console.error("Follow toggle error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Check if following a user
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const currentUser = session?.user;

    const { userId: targetUserId } = await params;

    if (!currentUser?.id) {
      return NextResponse.json({ isFollowing: false, followerCount: 0 });
    }

    const isFollowing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id as string,
          followingId: targetUserId,
        },
      },
    });

    const followerCount = await prisma.userFollow.count({
      where: { followingId: targetUserId },
    });

    return NextResponse.json({
      isFollowing: !!isFollowing,
      followerCount,
    });
  } catch (error) {
    console.error("Check follow error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
