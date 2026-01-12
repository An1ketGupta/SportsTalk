import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// Get comments for a post
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: postId } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const skip = (page - 1) * limit;

    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: skip,
      }),
      prisma.comment.count({
        where: { postId },
      }),
    ]);

    return NextResponse.json({
      comments: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          image: comment.author.image,
          username: comment.author.email?.split("@")[0] ?? "user",
        },
      })),
      hasMore: skip + comments.length < totalCount,
      total: totalCount,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Create a comment on a post
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: user.id as string,
        postId,
      },
      include: {
        author: true,
      },
    });

    // Create notification for post author (if not commenting on own post)
    if (post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: "comment",
          userId: post.authorId,
          actorId: user.id as string,
          postId,
        },
      });
    }

    return NextResponse.json({
      message: "Comment created successfully",
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          image: comment.author.image,
          username: comment.author.email?.split("@")[0] ?? "user",
        },
      },
    });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
