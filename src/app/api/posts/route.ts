import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Create a new post
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, mediaUrl, sport } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 280) {
      return NextResponse.json(
        { error: "Content exceeds 280 characters" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        mediaUrl: mediaUrl || null,
        sport: sport || null,
        authorId: user.id as string,
      },
      include: {
        author: true,
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    return NextResponse.json({
      message: "Post created successfully",
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
        },
        likeCount: post._count.likes,
        commentCount: post._count.comments,
      },
    });
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
