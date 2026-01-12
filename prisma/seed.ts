import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 15 demo users with sports-themed profiles
const usersData = [
  {
    name: "Sports Caster",
    email: "sportscaster@example.com",
    image: "https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?q=80&w=600&auto=format&fit=crop",
    bio: "Your go-to source for all sports updates. 🎙️",
  },
  {
    name: "NBA Insider",
    email: "nba_insider@example.com",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop",
    bio: "Breaking NBA news and analysis. 🏀",
  },
  {
    name: "Tennis News",
    email: "tennis_news@example.com",
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop",
    bio: "Grand Slam coverage and tennis updates. 🎾",
  },
  {
    name: "Cricket Analyst",
    email: "cricket_analyst@example.com",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600&auto=format&fit=crop",
    bio: "Cricket stats, match previews, and expert opinions. 🏏",
  },
  {
    name: "F1 Reporter",
    email: "f1_reporter@example.com",
    image: "https://images.unsplash.com/photo-1619785292559-a15caa28bde6?q=80&w=600&auto=format&fit=crop",
    bio: "Paddock access and race day coverage. 🏎️",
  },
  {
    name: "Football Fanatic",
    email: "football_fanatic@example.com",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop",
    bio: "Living for matchdays. Premier League and beyond. ⚽",
  },
  {
    name: "Hockey Hub",
    email: "hockey_hub@example.com",
    image: "https://images.unsplash.com/photo-1580748142162-1b5f8d21cb5a?q=80&w=600&auto=format&fit=crop",
    bio: "NHL coverage, trades, and game highlights. 🏒",
  },
  {
    name: "MMA Central",
    email: "mma_central@example.com",
    image: "https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?q=80&w=600&auto=format&fit=crop",
    bio: "UFC, Bellator, and all things MMA. 🥊",
  },
  {
    name: "Golf Digest",
    email: "golf_digest@example.com",
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=600&auto=format&fit=crop",
    bio: "PGA Tour coverage and golf tips. ⛳",
  },
  {
    name: "Baseball Beat",
    email: "baseball_beat@example.com",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=600&auto=format&fit=crop",
    bio: "MLB news, stats, and home run highlights. ⚾",
  },
  {
    name: "Rugby Report",
    email: "rugby_report@example.com",
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?q=80&w=600&auto=format&fit=crop",
    bio: "Six Nations, World Cup, and club rugby. 🏉",
  },
  {
    name: "Swimming Sensation",
    email: "swimming_sensation@example.com",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=600&auto=format&fit=crop",
    bio: "Olympic swimming and world records. 🏊",
  },
  {
    name: "Cycling Weekly",
    email: "cycling_weekly@example.com",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop",
    bio: "Tour de France and pro cycling updates. 🚴",
  },
  {
    name: "Boxing Insider",
    email: "boxing_insider@example.com",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=600&auto=format&fit=crop",
    bio: "Fight night coverage and boxing news. 🥋",
  },
  {
    name: "Esports Elite",
    email: "esports_elite@example.com",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
    bio: "Competitive gaming, tournaments, and team news. 🎮",
  },
];

// Sports categories for posts
const sports = [
  "football",
  "basketball",
  "tennis",
  "cricket",
  "f1",
  "nfl",
  "mma",
  "hockey",
  "golf",
  "baseball",
];

// 30 varied sports post contents
const postContents = [
  "What a finish! Absolute thriller in the last minute. 🔥",
  "This has to be one of the best performances of the season.",
  "Do you think this team can go all the way this year? Let me know below! 👇",
  "Coach's tactics today were on another level. Masterclass!",
  "Referee decisions were questionable, but what a game overall!",
  "Crowd atmosphere was electric from start to finish. ⚡",
  "That clutch play is going straight into the highlight reels.",
  "Injuries are starting to pile up — this could change everything.",
  "Defense wins championships, and today proved it again.",
  "Underdogs are cooking this season. Loving the chaos! 🔥",
  "Breaking: Major trade just went through. Thoughts?",
  "This rookie is the real deal. Mark my words.",
  "Veterans showing the young guns how it's done today.",
  "What a comeback story this season has been!",
  "The pressure was on and they delivered. Clutch performance!",
  "Pre-game analysis: here's what to watch for tonight.",
  "Post-game thoughts: where do they go from here?",
  "Transfer rumors heating up! Could this move actually happen?",
  "Training camp looking intense this year. Big expectations.",
  "Playoff picture is getting clearer. Who's your pick?",
  "Historic moment we just witnessed. One for the record books! 📚",
  "Stats don't lie — this player is having an MVP-caliber season.",
  "Game day energy is unmatched. Let's go! 💪",
  "Analysis thread: breaking down the key plays from yesterday.",
  "Hot take: this team is overrated. Change my mind.",
  "Injury update: not looking good for the star player. 😔",
  "Draft prospects looking stacked this year!",
  "Weather conditions might affect today's game. Stay tuned.",
  "Classic rivalry match coming up. Always delivers drama!",
  "Season predictions thread: drop your takes below! 🏆",
];

// Media URLs for posts (some posts will have images)
const mediaUrls = [
  "https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1619785292559-a15caa28bde6?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1578432014316-48b448d14d57?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544621678-a0ea36c48f2a?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop",
];

async function main() {
  console.log("🌱 Starting seed...\n");

  // Create 15 users
  console.log("Creating 15 users...");
  for (const userData of usersData) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
  }

  // Fetch all seeded users
  const authors = await prisma.user.findMany({
    where: {
      email: {
        in: usersData.map((u) => u.email),
      },
    },
  });

  console.log(`✅ Created ${authors.length} users\n`);

  // Generate 10 posts per user (150 posts total)
  console.log("Creating 10 posts per user (150 posts total)...");
  const now = Date.now();
  let postCount = 0;

  for (let authorIndex = 0; authorIndex < authors.length; authorIndex++) {
    const author = authors[authorIndex];

    for (let postIndex = 0; postIndex < 10; postIndex++) {
      const globalIndex = authorIndex * 10 + postIndex;
      const sport = sports[globalIndex % sports.length];
      const content = postContents[globalIndex % postContents.length];
      // Every 3rd post gets an image
      const mediaUrl = postIndex % 3 === 0 ? mediaUrls[globalIndex % mediaUrls.length] : null;

      await prisma.post.create({
        data: {
          content: `[${sport.toUpperCase()}] ${content}`,
          mediaUrl,
          sport,
          authorId: author.id,
          createdAt: new Date(now - globalIndex * 5 * 60 * 1000), // every 5 minutes in the past
        },
      });
      postCount++;
    }
    console.log(`  Created 10 posts for ${author.name}`);
  }

  console.log(`\n✅ Created ${postCount} posts`);

  const finalUserCount = await prisma.user.count();
  const finalPostCount = await prisma.post.count();

  console.log(`\n🎉 Seed complete!`);
  console.log(`   Total users: ${finalUserCount}`);
  console.log(`   Total posts: ${finalPostCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
