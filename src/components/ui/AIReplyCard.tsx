'use client';

import { getAgentColors } from "./AgentMention";
import { RenderContentWithMentions } from "./AgentMention";
import { GoCheckCircleFill } from "react-icons/go";
import Link from "next/link";

interface AIReplyProps {
  comment: {
    id: string;
    content: string;
    createdAt: string | Date;
    isAIGenerated?: boolean;
    aiProvider?: string | null;
    author: {
      id: string;
      name: string | null;
      image: string | null;
      username: string;
      isVerified?: boolean;
      isAI?: boolean;
      aiProvider?: string | null;
    };
  };
}

function formatTimeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
}

export default function AIReplyCard({ comment }: AIReplyProps) {
  const agentColors = getAgentColors(comment.aiProvider || comment.author.aiProvider || "");
  const createdAt = typeof comment.createdAt === "string" ? new Date(comment.createdAt) : comment.createdAt;

  const gradientBorder = agentColors
    ? `linear-gradient(135deg, ${agentColors.from}40, ${agentColors.to}20)`
    : "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.1))";

  const glowColor = agentColors?.color || "#8B5CF6";

  return (
    <div
      className="relative p-4 border-b border-gray-800 transition-all duration-300 hover:bg-gray-900/30"
    >
      {/* Subtle left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full"
      />

      <div className="flex gap-3 pl-2">
        {/* Agent Avatar */}
        <div className="flex-shrink-0 relative">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          >
            {agentColors?.avatar || "🤖"}
          </div>
          {/* Bot indicator dot */}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] border-2 border-black"
            style={{ background: glowColor }}
          >
            🤖
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm" style={{ color: glowColor }}>
              {comment.author.name ?? comment.author.username}
            </span>
            <GoCheckCircleFill className="w-3.5 h-3.5" style={{ color: glowColor }} />
            <span className="text-gray-500 text-xs">
              · {formatTimeAgo(createdAt)}
            </span>
          </div>

          <div className="text-[14px] leading-relaxed text-gray-200 whitespace-pre-line">
            <RenderContentWithMentions content={comment.content} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AITypingIndicator({ agentHandle }: { agentHandle: string }) {
  const agentColors = getAgentColors(agentHandle);
  const glowColor = agentColors?.color || "#8B5CF6";

  return (
    <div
      className="flex items-center gap-3 p-4 border-b border-gray-800 animate-pulse"
      style={{
        background: `linear-gradient(135deg, ${glowColor}10, transparent)`,
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
        style={{
          background: `${glowColor}20`,
          border: `2px solid ${glowColor}30`,
        }}
      >
        {agentColors?.avatar || "🤖"}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium" style={{ color: glowColor }}>
          {agentColors?.name || "AI"} is thinking
        </span>
        <span className="flex gap-1 ml-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                background: glowColor,
                animationDelay: `${i * 0.15}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
