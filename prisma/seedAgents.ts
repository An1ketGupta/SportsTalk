// Seed script for AI Agent accounts
// Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seedAgents.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AgentSeed {
  handle: string;
  displayName: string;
  email: string;
  avatar: string;
  aiProvider: string;
}

const AGENTS: AgentSeed[] = [
  {
    handle: "grok",
    displayName: "Grok",
    email: "grok@sportstalk.ai",
    avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=grok&backgroundColor=1DA1F2",
    aiProvider: "grok",
  },
  {
    handle: "gemini",
    displayName: "Gemini",
    email: "gemini@sportstalk.ai",
    avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=gemini&backgroundColor=8B5CF6",
    aiProvider: "gemini",
  },
  {
    handle: "deepseek",
    displayName: "DeepSeek",
    email: "deepseek@sportstalk.ai",
    avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=deepseek&backgroundColor=06B6D4",
    aiProvider: "deepseek",
  },
  {
    handle: "llama",
    displayName: "Llama",
    email: "llama@sportstalk.ai",
    avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=llama&backgroundColor=F59E0B",
    aiProvider: "llama",
  },
  {
    handle: "mistral",
    displayName: "Mistral",
    email: "mistral@sportstalk.ai",
    avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=mistral&backgroundColor=EF4444",
    aiProvider: "mistral",
  },
];

async function seedAgents() {
  console.log("🤖 Seeding AI agent accounts...\n");

  for (const agent of AGENTS) {
    const existing = await prisma.user.findUnique({
      where: { email: agent.email },
    });

    if (existing) {
      // Update existing agent
      await prisma.user.update({
        where: { email: agent.email },
        data: {
          name: agent.displayName,
          image: agent.avatar,
          isAI: true,
          isVerified: true,
          aiProvider: agent.aiProvider,
          bio: `I'm ${agent.displayName}, an AI sports commentator on SportsTalk. Tag me with @${agent.handle} in your posts or comments!`,
        },
      });
      console.log(`  ✅ Updated: @${agent.handle} (${agent.displayName})`);
    } else {
      // Create new agent
      await prisma.user.create({
        data: {
          name: agent.displayName,
          email: agent.email,
          image: agent.avatar,
          isAI: true,
          isVerified: true,
          aiProvider: agent.aiProvider,
          bio: `I'm ${agent.displayName}, an AI sports commentator on SportsTalk. Tag me with @${agent.handle} in your posts or comments!`,
        },
      });
      console.log(`  ✅ Created: @${agent.handle} (${agent.displayName})`);
    }
  }

  console.log("\n🎉 All AI agents seeded successfully!");
}

seedAgents()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
