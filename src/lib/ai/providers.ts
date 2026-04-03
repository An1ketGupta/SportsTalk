// AI Provider — Unified interface for calling different AI APIs

import { type AgentHandle, type AgentConfig } from "./config";

interface AIResponse {
  content: string;
  provider: AgentHandle;
  tokensUsed?: number;
}

export async function callProvider(
  agent: AgentConfig,
  userMessage: string,
  postContext?: string
): Promise<AIResponse> {
  const apiKey = process.env[agent.provider.envKey];

  if (!apiKey) {
    console.error(`[Provider:${agent.handle}] ❌ No API key found for env var: ${agent.provider.envKey}`);
    throw new Error(`API key not configured for ${agent.displayName} (${agent.provider.envKey})`);
  }

  console.log(`[Provider:${agent.handle}] 🔑 API key loaded (${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)})`);

  const contextMessage = postContext
    ? `Context of the conversation:\n${postContext}\n\nUser's message:\n${userMessage}`
    : userMessage;

  if (agent.provider.type === "gemini") {
    return callGemini(agent, apiKey, contextMessage);
  } else {
    return callOpenAICompatible(agent, apiKey, contextMessage);
  }
}

async function callOpenAICompatible(
  agent: AgentConfig,
  apiKey: string,
  message: string
): Promise<AIResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  // OpenRouter requires additional headers
  if (agent.handle === "mistral") {
    headers["HTTP-Referer"] = process.env.NEXTAUTH_URL || "http://localhost:3000";
    headers["X-Title"] = "SportsTalk";
    console.log(`[Provider:${agent.handle}] 📋 OpenRouter headers added: Referer=${headers["HTTP-Referer"]}`);
  }

  // HuggingFace needs different auth header format
  if (agent.handle === "deepseek") {
    // HF uses Bearer token same as OpenAI, should work as-is
    console.log(`[Provider:${agent.handle}] 📋 HuggingFace request to: ${agent.provider.apiUrl}`);
  }

  const body = {
    model: agent.provider.model,
    messages: [
      { role: "system", content: agent.systemPrompt },
      { role: "user", content: message },
    ],
    max_tokens: agent.provider.maxTokens,
    temperature: 0.8,
  };

  console.log(`[Provider:${agent.handle}] 🚀 Sending request to: ${agent.provider.apiUrl}`);
  console.log(`[Provider:${agent.handle}] 📦 Model: ${agent.provider.model}`);
  console.log(`[Provider:${agent.handle}] 📝 Message length: ${message.length} chars`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.error(`[Provider:${agent.handle}] ⏰ Request timed out after 60s`);
    controller.abort();
  }, 60000); // Increased to 60s for reasoning models

  const startTime = Date.now();

  try {
    const response = await fetch(agent.provider.apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const elapsed = Date.now() - startTime;
    console.log(`[Provider:${agent.handle}] 📡 Response: ${response.status} ${response.statusText} (${elapsed}ms)`);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Could not read error body");
      console.error(`[Provider:${agent.handle}] ❌ API Error Response Body:\n${errorBody}`);
      throw new ProviderError(
        `${agent.displayName} API error: ${response.status} ${response.statusText} - ${errorBody}`,
        response.status,
        agent.handle
      );
    }

    const data = await response.json();
    
    // Log keys for debugging if something goes wrong
    console.log(`[Provider:${agent.handle}] 📥 Response JSON keys: ${Object.keys(data).join(", ")}`);

    const message = data.choices?.[0]?.message;
    
    // Handle different models: regular content, HuggingFace's reasoning_content, or OpenRouter's reasoning
    let content = message?.content?.trim();
    if (!content) {
      content = message?.reasoning_content?.trim() || message?.reasoning?.trim();
      if (content) {
        console.log(`[Provider:${agent.handle}] 🧠 Fallback to reasoning tokens since output was empty`);
      }
    }

    if (!content) {
      console.error(`[Provider:${agent.handle}] ❌ Empty content! Full response:`, JSON.stringify(data, null, 2).substring(0, 1500));
      throw new ProviderError(
        `${agent.displayName} returned empty response`,
        500,
        agent.handle
      );
    }

    console.log(`[Provider:${agent.handle}] ✅ Got response: ${content.substring(0, 100)}... (${content.length} chars)`);
    console.log(`[Provider:${agent.handle}] 📊 Tokens used: ${data.usage?.total_tokens ?? "unknown"}`);

    return {
      content,
      provider: agent.handle,
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    const elapsed = Date.now() - startTime;
    console.error(`[Provider:${agent.handle}] ❌ Fetch error after ${elapsed}ms:`, error instanceof Error ? error.message : error);
    throw new ProviderError(
      `${agent.displayName} fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
      agent.handle
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGemini(
  agent: AgentConfig,
  apiKey: string,
  message: string
): Promise<AIResponse> {
  const url = `${agent.provider.apiUrl}/${agent.provider.model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: message }],
      },
    ],
    systemInstruction: {
      parts: [{ text: agent.systemPrompt }],
    },
    generationConfig: {
      maxOutputTokens: agent.provider.maxTokens,
      temperature: 0.8,
    },
  };

  console.log(`[Provider:${agent.handle}] 🚀 Sending Gemini request to: ${url.replace(apiKey, "***")}`);
  console.log(`[Provider:${agent.handle}] 📦 Model: ${agent.provider.model}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.error(`[Provider:${agent.handle}] ⏰ Gemini request timed out after 30s`);
    controller.abort();
  }, 30000);

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const elapsed = Date.now() - startTime;
    console.log(`[Provider:${agent.handle}] 📡 Gemini Response: ${response.status} ${response.statusText} (${elapsed}ms)`);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Could not read error body");
      console.error(`[Provider:${agent.handle}] ❌ Gemini Error Response Body:\n${errorBody}`);
      throw new ProviderError(
        `Gemini API error: ${response.status} ${response.statusText} - ${errorBody}`,
        response.status,
        agent.handle
      );
    }

    const data = await response.json();
    console.log(`[Provider:${agent.handle}] 📥 Gemini response keys: ${Object.keys(data).join(", ")}`);

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!content) {
      console.error(`[Provider:${agent.handle}] ❌ Gemini empty content! Full response:`, JSON.stringify(data, null, 2).substring(0, 1000));
      throw new ProviderError(
        "Gemini returned empty response",
        500,
        agent.handle
      );
    }

    console.log(`[Provider:${agent.handle}] ✅ Gemini response: ${content.substring(0, 100)}... (${content.length} chars)`);

    return {
      content,
      provider: agent.handle,
      tokensUsed: data.usageMetadata?.totalTokenCount,
    };
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    const elapsed = Date.now() - startTime;
    console.error(`[Provider:${agent.handle}] ❌ Gemini fetch error after ${elapsed}ms:`, error instanceof Error ? error.message : error);
    throw new ProviderError(
      `Gemini fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
      agent.handle
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export class ProviderError extends Error {
  statusCode: number;
  providerHandle: AgentHandle;

  constructor(message: string, statusCode: number, providerHandle: AgentHandle) {
    super(message);
    this.name = "ProviderError";
    this.statusCode = statusCode;
    this.providerHandle = providerHandle;
  }

  get isRetryable(): boolean {
    return this.statusCode === 429 || this.statusCode >= 500;
  }
}
