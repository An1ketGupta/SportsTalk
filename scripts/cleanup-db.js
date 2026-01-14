// Database cleanup script - keeps only guptaaniket account, removes all other data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database cleanup...');

    // Find the guptaaniket user by email pattern
    const guptaaniketUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { contains: 'guptaaniket' } },
                { email: { contains: 'aniketgupta' } },
                { name: { contains: 'aniket', mode: 'insensitive' } }
            ]
        }
    });

    if (!guptaaniketUser) {
        console.log('Could not find guptaaniket user. Please check the email.');
        console.log('\nListing all users:');
        const allUsers = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
        console.log(allUsers);
        process.exit(1);
    }

    console.log(`Found user to keep: ${guptaaniketUser.email} (ID: ${guptaaniketUser.id})`);

    // Delete all notifications
    const deletedNotifications = await prisma.notification.deleteMany({});
    console.log(`Deleted ${deletedNotifications.count} notifications`);

    // Delete all messages
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`Deleted ${deletedMessages.count} messages`);

    // Delete all likes
    const deletedLikes = await prisma.like.deleteMany({});
    console.log(`Deleted ${deletedLikes.count} likes`);

    // Delete all comments
    const deletedComments = await prisma.comment.deleteMany({});
    console.log(`Deleted ${deletedComments.count} comments`);

    // Delete all posts
    const deletedPosts = await prisma.post.deleteMany({});
    console.log(`Deleted ${deletedPosts.count} posts`);

    // Delete all follows
    const deletedFollows = await prisma.userFollow.deleteMany({});
    console.log(`Deleted ${deletedFollows.count} follows`);

    // Delete all sessions except for the user we're keeping
    const deletedSessions = await prisma.session.deleteMany({
        where: { userId: { not: guptaaniketUser.id } }
    });
    console.log(`Deleted ${deletedSessions.count} sessions`);

    // Delete all accounts except for the user we're keeping
    const deletedAccounts = await prisma.account.deleteMany({
        where: { userId: { not: guptaaniketUser.id } }
    });
    console.log(`Deleted ${deletedAccounts.count} accounts`);

    // Delete all users except guptaaniket
    const deletedUsers = await prisma.user.deleteMany({
        where: { id: { not: guptaaniketUser.id } }
    });
    console.log(`Deleted ${deletedUsers.count} users`);

    console.log('\nDatabase cleanup complete!');
    console.log(`Kept user: ${guptaaniketUser.email}`);
}

main()
    .catch((e) => {
        console.error('Error during cleanup:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
