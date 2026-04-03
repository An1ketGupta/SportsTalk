import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { parseAgentMentions } from "@/lib/ai/config";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Fire-and-forget helper to trigger AI agent responses for comment mentions.
 */
async function triggerAgentResponsesForComment(
  postId: string,
  commentContent: string,
  authorName: string,
  baseUrl: string
) {
  const mentions = parseAgentMentions(commentContent);
  if (mentions.length === 0) return;

  const promises = mentions.map(async (handle) => {
    try {
      await fetch(`${baseUrl}/api/ai/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          agentHandle: handle,
          postContent: commentContent,
          authorName,
        }),
      });
    } catch (error) {
      console.error(`[AI Trigger] Failed to trigger ${handle} for comment:`, error);
    }
  });

  Promise.allSettled(promises).catch(console.error);
}

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
        isAIGenerated: comment.isAIGenerated,
        aiProvider: comment.aiProvider,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          image: comment.author.image,
          username: comment.author.email?.split("@")[0] ?? "user",
          isVerified: comment.author.isVerified,
          isAI: comment.author.isAI,
          aiProvider: comment.author.aiProvider,
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

    // Trigger AI agent responses for comment mentions (fire-and-forget)
    const baseUrl = req.nextUrl.origin;
    triggerAgentResponsesForComment(
      postId,
      content.trim(),
      comment.author.name || user.email?.split("@")[0] || "A user",
      baseUrl
    );

    return NextResponse.json({
      message: "Comment created successfully",
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        isAIGenerated: comment.isAIGenerated,
        aiProvider: comment.aiProvider,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          image: comment.author.image,
          username: comment.author.email?.split("@")[0] ?? "user",
          isVerified: comment.author.isVerified,
          isAI: comment.author.isAI,
          aiProvider: comment.author.aiProvider,
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
