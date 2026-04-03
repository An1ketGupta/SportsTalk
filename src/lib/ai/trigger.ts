import { parseAgentMentions } from "./config";

/**
 * Triggers AI agent responses by calling the internal /api/ai/respond endpoint.
 * In production (Render/Vercel), we prioritize NEXTAUTH_URL to ensure stable internal routing.
 */
export async function triggerAgentResponses(
  postId: string,
  content: string,
  authorName: string,
  requestOrigin: string
) {
  const mentions = parseAgentMentions(content);
  if (mentions.length === 0) return;

  // Prioritize the actual live request origin since NEXTAUTH_URL might point to an old Vercel deployment
  let baseUrl = requestOrigin;
  if (!baseUrl || !baseUrl.startsWith("http")) {
    baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";
  }

  console.log(`[AI Trigger] 🎯 Found ${mentions.length} agent mention(s): ${mentions.join(", ")}`);
  console.log(`[AI Trigger] 🌐 Base URL: ${baseUrl}`);

  // We await the trigger calls themselves to ensure they are at least RECEIVED 
  // by the background handler before the main request finishes (important for Render/Vercel)
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
          postContent: content,
          authorName,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        console.error(`[AI Trigger] ❌ @${handle} trigger failed (${res.status}):`, errorText);
      } else {
        const data = await res.json().catch(() => ({}));
        console.log(`[AI Trigger] 📥 @${handle} trigger response: ${res.status} — ${data.success ? "✅ success" : "❌ failed"}`);
      }
    } catch (error) {
      console.error(`[AI Trigger] ❌ Failed to trigger @${handle}:`, error instanceof Error ? error.message : error);
    }
  });

  // Wait for all trigger requests to be sent
  await Promise.allSettled(promises);
}
