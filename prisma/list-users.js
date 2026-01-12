// List seeded users and their post counts
const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: { posts: true }
      }
    },
    orderBy: { name: 'asc' }
  });
  
  console.log("\n📋 Users and their post counts:\n");
  users.forEach(u => {
    console.log(`  ${u.name || 'No name'} (${u.email}) - ${u._count.posts} posts`);
  });
  
  console.log(`\nTotal: ${users.length} users`);
  await prisma.$disconnect();
}

listUsers();
