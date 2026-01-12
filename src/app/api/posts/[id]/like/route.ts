import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// Toggle like on a post
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id as string,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike: delete the like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      const likeCount = await prisma.like.count({
        where: { postId },
      });

      return NextResponse.json({
        message: "Post unliked",
        isLiked: false,
        likeCount,
      });
    } else {
      // Like: create new like
      await prisma.like.create({
        data: {
          userId: user.id as string,
          postId,
        },
      });

      // Create notification for post author (if not liking own post)
      if (post.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            type: "like",
            userId: post.authorId,
            actorId: user.id as string,
            postId,
          },
        });
      }

      const likeCount = await prisma.like.count({
        where: { postId },
      });

      return NextResponse.json({
        message: "Post liked",
        isLiked: true,
        likeCount,
      });
    }
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
