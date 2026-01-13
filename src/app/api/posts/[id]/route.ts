import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// Get a single post by ID
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const session = await auth();
    const currentUserId = session?.user?.id;

    return NextResponse.json({
      post: {
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        mediaUrl: post.mediaUrl,
        sport: post.sport,
        author: {
          id: post.author.id,
          name: post.author.name,
          image: post.author.image,
          username: post.author.email?.split("@")[0] ?? "user",
          isVerified: post.author.isVerified,
        },
        likeCount: post.likes.length,
        commentCount: post.comments.length,
        isLiked: currentUserId
          ? post.likes.some((like) => like.userId === currentUserId)
          : false,
        comments: post.comments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          author: {
            id: comment.author.id,
            name: comment.author.name,
            image: comment.author.image,
            username: comment.author.email?.split("@")[0] ?? "user",
            isVerified: comment.author.isVerified,
          },
        })),
      },
    });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Delete a post
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
