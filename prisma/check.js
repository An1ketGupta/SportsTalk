// Check database counts
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.count();
  const posts = await prisma.post.count();
  console.log("Users:", users);
  console.log("Posts:", posts);
  await prisma.$disconnect();
}

check();
