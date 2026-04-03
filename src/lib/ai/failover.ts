// Failover Orchestrator
// Tries the preferred provider first, then rotates through remaining providers on failure

import { AGENTS, FAILOVER_ORDER, type AgentHandle } from "./config";
import { callProvider, ProviderError } from "./providers";

interface FailoverResult {
  content: string;
  /** The agent that was originally requested */
  requestedAgent: AgentHandle;
  /** The agent that actually answered (may differ if failover occurred) */
  respondingAgent: AgentHandle;
  /** Whether a failover occurred */
  didFailover: boolean;
  /** Failover details message (if applicable) */
  failoverNote?: string;
}

/**
 * Generate an AI reply with automatic failover.
 * 
 * 1. Try the requested agent first
 * 2. If it fails with a retryable error, try other providers in FAILOVER_ORDER
 * 3. If all fail, throw an error
 */
export async function generateWithFailover(
  preferredHandle: AgentHandle,
  userMessage: string,
  postContext?: string
): Promise<FailoverResult> {
  const preferredAgent = AGENTS[preferredHandle];

  // Try preferred agent first
  try {
    const response = await callProvider(preferredAgent, userMessage, postContext);
    return {
      content: response.content,
      requestedAgent: preferredHandle,
      respondingAgent: preferredHandle,
      didFailover: false,
    };
  } catch (error) {
    console.error(`[AI Failover] ${preferredHandle} failed:`, error instanceof Error ? error.message : error);

    // Only failover on retryable errors
    if (error instanceof ProviderError && !error.isRetryable) {
      throw error; // Non-retryable (e.g., auth error) — don't try others
    }
  }

  // Failover: try remaining providers in order
  const failoverProviders = FAILOVER_ORDER.filter((h) => h !== preferredHandle);
  const errors: string[] = [`${preferredHandle}: failed`];

  for (const handle of failoverProviders) {
    const agent = AGENTS[handle];

    try {
      console.log(`[AI Failover] Trying ${handle} as fallback for ${preferredHandle}...`);
      const response = await callProvider(agent, userMessage, postContext);

      return {
        content: response.content,
        requestedAgent: preferredHandle,
        respondingAgent: handle,
        didFailover: true,
        failoverNote: `${AGENTS[preferredHandle].displayName} was unavailable. Answered by ${agent.displayName} instead.`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error(`[AI Failover] ${handle} also failed:`, msg);
      errors.push(`${handle}: ${msg}`);
    }
  }

  // All providers failed
  throw new Error(
    `All AI providers failed to generate a response.\n${errors.join("\n")}`
  );
}
