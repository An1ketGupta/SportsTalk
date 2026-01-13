
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
    console.log('Test script started...');

    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL is not defined in the environment.');
        return;
    }

    console.log('DATABASE_URL found (length: ' + process.env.DATABASE_URL.length + ')');
    // Masking the password and printing the host to verify
    const urlParts = process.env.DATABASE_URL.split('@');
    if (urlParts.length > 1) {
        console.log('Connection host:', urlParts[1]);
    } else {
        console.log('Could not parse host from DATABASE_URL');
    }

    const prisma = new PrismaClient();

    try {
        console.log('Attempting to connect to the database...');
        await prisma.$connect();
        console.log('Successfully connected to the database!');

        // Try a simple query
        const userCount = await prisma.user.count();
        console.log(`Connection verified. User count: ${userCount}`);

    } catch (e) {
        console.error('Connection failed!');
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
