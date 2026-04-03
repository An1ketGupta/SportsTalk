import { parseAgentMentions, AGENTS } from "./config";
import { generateWithFailover } from "./failover";
import prisma from "../db";

/**
 * Triggers AI agent responses directly in the background.
 * By directly executing functions rather than sending an HTTP fetch to our own server,
 * we entirely bypass proxy latency and routing blocks on Render/Vercel.
 */
export async function triggerAgentResponses(
  postId: string,
  content: string,
  authorName: string,
  requestOrigin: string // kept for interface compatibility
) {
  const mentions = parseAgentMentions(content);
  if (mentions.length === 0) {
    console.log(`[AI Trigger] No agent mentions found in: "${content.substring(0, 40)}"`);
    return;
  }

  console.log(`[AI Trigger] 🎯 Found ${mentions.length} agent mention(s): ${mentions.join(", ")}`);

  // Process triggers quietly in the background without HTTP overhead
  const promises = mentions.map(async (handle) => {
    try {
      console.log(`[AI Trigger] 📤 Generating response for @${handle}...`);
      
      const agentUser = await prisma.user.findFirst({
        where: { isAI: true, aiProvider: handle },
      });

      if (!agentUser) {
        console.error(`[AI Trigger] ❌ Agent user @${handle} not found in DB! Seed the DB!`);
        return;
      }

      const context = authorName
        ? `${authorName} said on SportsTalk: "${content}"`
        : `A user said on SportsTalk: "${content}"`;

      const startTime = Date.now();
      const result = await generateWithFailover(handle, content, context);
      const elapsed = Date.now() - startTime;
      
      console.log(`[AI Trigger] ✅ @${result.respondingAgent} completed in ${elapsed}ms`);

      let replyContent = result.content;
      if (result.didFailover && result.failoverNote) {
        replyContent += `\n\n_${result.failoverNote}_`;
      }

      const comment = await prisma.comment.create({
        data: {
          content: replyContent,
          isAIGenerated: true,
          aiProvider: result.respondingAgent,
          authorId: agentUser.id,
          postId: postId,
        },
      });

      console.log(`[AI Trigger] 💾 Saved comment ${comment.id} for @${result.respondingAgent}`);
    } catch (error) {
      console.error(`[AI Trigger] ❌ Fatal error for @${handle}:`, error instanceof Error ? error.message : error);
    }
  });

  // Since we removed network boundaries, awaiting this performs computation inline.
  // We can let them run concurrently, and just return so the parent request isn't blocked.
  // On Render, persistent node deployments keep promises alive natively.
  Promise.allSettled(promises);
}
