'use client';

import { AGENTS, type AgentHandle, AGENT_HANDLES } from "@/lib/ai/config";

// Agent color map for client-side use
const AGENT_COLORS: Record<string, { color: string; from: string; to: string; avatar: string; name: string }> = {
  grok:     { color: "#1DA1F2", from: "#1DA1F2", to: "#0D8ECF", avatar: "⚡", name: "Grok" },
  gemini:   { color: "#8B5CF6", from: "#8B5CF6", to: "#6D28D9", avatar: "✨", name: "Gemini" },
  deepseek: { color: "#06B6D4", from: "#06B6D4", to: "#0891B2", avatar: "🔍", name: "DeepSeek" },
  llama:    { color: "#F59E0B", from: "#F59E0B", to: "#D97706", avatar: "🦙", name: "Llama" },
  mistral:  { color: "#EF4444", from: "#EF4444", to: "#DC2626", avatar: "🌀", name: "Mistral" },
};

/**
 * Renders post/comment content with @agent mentions highlighted
 */
export function RenderContentWithMentions({ content }: { content: string }) {
  // Split content by @agent mentions
  const parts = content.split(/(@(?:grok|gemini|deepseek|llama|mistral))\b/gi);

  return (
    <span>
      {parts.map((part, i) => {
        const match = part.match(/^@(grok|gemini|deepseek|llama|mistral)$/i);
        if (match) {
          const handle = match[1].toLowerCase();
          const agent = AGENT_COLORS[handle];
          if (agent) {
            return (
              <span
                key={i}
                className="inline-flex items-center gap-0.5 font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: agent.color }}
                title={`${agent.name} — AI Sports Agent`}
              >
                <span className="text-xs">{agent.avatar}</span>
                @{handle}
              </span>
            );
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export const AI_AGENT_SUGGESTIONS = Object.entries(AGENT_COLORS).map(([handle, config]) => ({
  handle,
  displayName: config.name,
  avatar: config.avatar,
  color: config.color,
}));

export function isAgentHandle(username: string): boolean {
  return Object.keys(AGENT_COLORS).includes(username.toLowerCase());
}

export function getAgentColors(handle: string) {
  return AGENT_COLORS[handle.toLowerCase()] ?? null;
}
