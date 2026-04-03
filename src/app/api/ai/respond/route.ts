// API Route: /api/ai/respond
// Generates AI agent replies to posts that mention @agent handles

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { AGENTS, type AgentHandle, AGENT_HANDLES } from "@/lib/ai/config";
import { generateWithFailover } from "@/lib/ai/failover";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, agentHandle, postContent, authorName } = body;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`[AI Respond] 📨 Request received for @${agentHandle}`);
    console.log(`[AI Respond] 📝 Post ID: ${postId}`);
    console.log(`[AI Respond] 👤 Author: ${authorName}`);
    console.log(`[AI Respond] 💬 Content: ${postContent?.substring(0, 100)}...`);

    // Validate agent handle
    if (!agentHandle || !AGENT_HANDLES.includes(agentHandle as AgentHandle)) {
      return NextResponse.json(
        { error: `Invalid agent handle: ${agentHandle}` },
        { status: 400 }
      );
    }

    if (!postId || !postContent) {
      return NextResponse.json(
        { error: "postId and postContent are required" },
        { status: 400 }
      );
    }

    const handle = agentHandle as AgentHandle;
    const agent = AGENTS[handle];

    // Find the AI agent's user account
    const agentUser = await prisma.user.findFirst({
      where: {
        isAI: true,
        aiProvider: handle,
      },
    });

    if (!agentUser) {
      console.error(`[AI Respond] ❌ Agent user not found in DB for provider: ${handle}`);
      return NextResponse.json(
        { error: `Agent ${handle} not found. Please seed AI agents.` },
        { status: 404 }
      );
    }

    console.log(`[AI Respond] ✅ Found agent user: ${agentUser.name} (ID: ${agentUser.id})`);

    // Build context for the AI
    const context = authorName
      ? `${authorName} said on SportsTalk: "${postContent}"`
      : `A user said on SportsTalk: "${postContent}"`;

    // Generate AI response with failover
    console.log(`[AI Respond] 🤖 Calling generateWithFailover for @${handle}...`);
    const startTime = Date.now();
    const result = await generateWithFailover(handle, postContent, context);
    const elapsed = Date.now() - startTime;
    console.log(`[AI Respond] ✅ Got response from @${result.respondingAgent} in ${elapsed}ms`);
    console.log(`[AI Respond] 📝 Response preview: ${result.content.substring(0, 100)}...`);
    if (result.didFailover) {
      console.log(`[AI Respond] ⚠️ FAILOVER: Requested @${result.requestedAgent}, answered by @${result.respondingAgent}`);
    }

    // Build the reply content
    let replyContent = result.content;
    if (result.didFailover && result.failoverNote) {
      replyContent += `\n\n_${result.failoverNote}_`;
    }

    // Save as a comment on the post
    const comment = await prisma.comment.create({
      data: {
        content: replyContent,
        isAIGenerated: true,
        aiProvider: result.respondingAgent,
        authorId: agentUser.id,
        postId: postId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            isVerified: true,
            isAI: true,
            aiProvider: true,
          },
        },
      },
    });

    console.log(`[AI Respond] 💾 Comment saved: ${comment.id}`);
    console.log(`${'='.repeat(60)}\n`);

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        isAIGenerated: comment.isAIGenerated,
        aiProvider: comment.aiProvider,
        didFailover: result.didFailover,
        requestedAgent: result.requestedAgent,
        respondingAgent: result.respondingAgent,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          image: comment.author.image,
          username: comment.author.email?.split("@")[0] ?? handle,
          isVerified: comment.author.isVerified,
          isAI: comment.author.isAI,
          aiProvider: comment.author.aiProvider,
        },
      },
    });
  } catch (error) {
    console.error(`[AI Respond] ❌ FATAL ERROR:`, error);
    console.error(`${'='.repeat(60)}\n`);
    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
