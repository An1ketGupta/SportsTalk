import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { parseAgentMentions } from "@/lib/ai/config";

/**
 * Fire-and-forget helper to trigger AI agent responses.
 * Calls the internal /api/ai/respond endpoint for each mentioned agent.
 * Does not block the post creation response.
 */
async function triggerAgentResponses(
  postId: string,
  postContent: string,
  authorName: string,
  baseUrl: string
) {
  const mentions = parseAgentMentions(postContent);
  if (mentions.length === 0) {
    console.log(`[AI Trigger] No agent mentions found in: "${postContent.substring(0, 80)}"`);
    return;
  }

  console.log(`[AI Trigger] 🎯 Found ${mentions.length} agent mention(s): ${mentions.join(", ")}`);
  console.log(`[AI Trigger] 🌐 Base URL: ${baseUrl}`);

  // Trigger each agent in parallel (fire-and-forget)
  const promises = mentions.map(async (handle) => {
    try {
      console.log(`[AI Trigger] 📤 Triggering @${handle} for post ${postId}...`);
      const triggerUrl = `${baseUrl}/api/ai/respond`;
      const res = await fetch(triggerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          agentHandle: handle,
          postContent,
          authorName,
        }),
      });
      const data = await res.json().catch(() => ({}));
      console.log(`[AI Trigger] 📥 @${handle} trigger response: ${res.status} — ${data.success ? "✅ success" : `❌ ${data.error || "failed"}`}`);
    } catch (error) {
      console.error(`[AI Trigger] ❌ Failed to trigger @${handle}:`, error instanceof Error ? error.message : error);
    }
  });

  // Don't await — let them run in the background
  Promise.allSettled(promises).catch(console.error);
}

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

    // Trigger AI agent responses (fire-and-forget)
    const baseUrl = req.nextUrl.origin;
    triggerAgentResponses(
      post.id,
      post.content,
      post.author.name || user.email?.split("@")[0] || "A user",
      baseUrl
    );

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
