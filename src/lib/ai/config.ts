// AI Agent Configuration
// Each agent has a unique personality, provider config, and visual identity

export interface AgentConfig {
  handle: AgentHandle;   // e.g. "grok" (used as @grok)
  displayName: string;
  avatar: string;        // emoji or URL
  color: string;         // primary brand color (hex)
  gradientFrom: string;
  gradientTo: string;
  systemPrompt: string;
  provider: ProviderConfig;
}

export interface ProviderConfig {
  type: "openai-compatible" | "gemini";
  apiUrl: string;
  model: string;
  envKey: string;        // env var name for API key
  maxTokens: number;
}

export const AGENT_HANDLES = ["grok", "gemini", "deepseek", "llama", "mistral"] as const;
export type AgentHandle = (typeof AGENT_HANDLES)[number];

export const AGENTS: Record<AgentHandle, AgentConfig> = {
  grok: {
    handle: "grok",
    displayName: "Grok",
    avatar: "⚡",
    color: "#1DA1F2",
    gradientFrom: "#1DA1F2",
    gradientTo: "#0D8ECF",
    systemPrompt: `You are Grok, a witty and sharp sports commentator on SportsTalk. You're known for your humor, hot takes, and bold predictions. Keep responses concise (under 250 words), engaging, and sports-focused. Use casual language and occasional emojis. If asked about non-sports topics, steer the conversation back to sports with a clever quip.`,
    provider: {
      type: "openai-compatible",
      apiUrl: "https://api.groq.com/openai/v1/chat/completions",
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      envKey: "GROQ_API_KEY",
      maxTokens: 2048,
    },
  },
  gemini: {
    handle: "gemini",
    displayName: "Gemini",
    avatar: "✨",
    color: "#8B5CF6",
    gradientFrom: "#8B5CF6",
    gradientTo: "#6D28D9",
    systemPrompt: `You are Gemini, an analytical and insightful sports commentator on SportsTalk. You're known for data-driven analysis, historical comparisons, and balanced takes. Keep responses concise (under 250 words), informative, and well-structured. You appreciate both the strategy and artistry of sports.`,
    provider: {
      type: "gemini",
      apiUrl: "https://generativelanguage.googleapis.com/v1beta/models",
      model: "gemini-2.5-flash",
      envKey: "GEMINI_API_KEY",
      maxTokens: 2048,
    },
  },
  deepseek: {
    handle: "deepseek",
    displayName: "DeepSeek",
    avatar: "🔍",
    color: "#06B6D4",
    gradientFrom: "#06B6D4",
    gradientTo: "#0891B2",
    systemPrompt: `You are DeepSeek, a deep-thinking sports analyst on SportsTalk. You dig beneath the surface to find patterns and insights others miss. Keep responses concise (under 250 words), thoughtful, and analytical. You love discussing tactics, player development, and the mental side of sports.`,
    provider: {
      type: "openai-compatible",
      apiUrl: "https://router.huggingface.co/v1/chat/completions",
      model: "zai-org/GLM-4.7-Flash",
      envKey: "HF_API_KEY",
      maxTokens: 2048,
    },
  },
  llama: {
    handle: "llama",
    displayName: "Llama",
    avatar: "🦙",
    color: "#F59E0B",
    gradientFrom: "#F59E0B",
    gradientTo: "#D97706",
    systemPrompt: `You are Llama, an enthusiastic and passionate sports fan on SportsTalk. You bring the energy of a stadium crowd to every conversation. Keep responses concise (under 250 words), lively, and fun. You love celebrating great plays, supporting underdogs, and getting hyped about upcoming matches.`,
    provider: {
      type: "openai-compatible",
      apiUrl: "https://api.groq.com/openai/v1/chat/completions",
      model: "llama-3.3-70b-versatile",
      envKey: "GROQ_API_KEY",
      maxTokens: 2048,
    },
  },
  mistral: {
    handle: "mistral",
    displayName: "Mistral",
    avatar: "🌀",
    color: "#EF4444",
    gradientFrom: "#EF4444",
    gradientTo: "#DC2626",
    systemPrompt: `You are Mistral, a sophisticated and cultured sports commentator on SportsTalk. You bring a global perspective, appreciating sports from every continent. Keep responses concise (under 250 words), elegant, and worldly. You enjoy drawing connections between different sports and cultures.`,
    provider: {
      type: "openai-compatible",
      apiUrl: "https://openrouter.ai/api/v1/chat/completions",
      model: "openai/gpt-oss-120b",
      envKey: "OR_API_KEY",
      maxTokens: 2048,
    },
  },
};

// Failover priority order — fastest/most-reliable first
export const FAILOVER_ORDER: AgentHandle[] = [
  "grok",      // Groq (Llama 4 Scout — fastest)
  "llama",     // Groq (Llama 3.3)
  "mistral",   // OpenRouter
  "deepseek",  // HuggingFace
  "gemini",    // Google
];

/**
 * Parse @agent mentions from text content.
 * Returns unique agent handles found in the text.
 */
export function parseAgentMentions(text: string): AgentHandle[] {
  const mentionRegex = /@(grok|gemini|deepseek|llama|mistral)\b/gi;
  const matches = text.matchAll(mentionRegex);
  const handles = new Set<AgentHandle>();

  for (const match of matches) {
    const handle = match[1].toLowerCase() as AgentHandle;
    if (AGENT_HANDLES.includes(handle)) {
      handles.add(handle);
    }
  }

  return Array.from(handles);
}
