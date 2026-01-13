"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// List of admin emails who can verify/unverify users
const ADMIN_EMAILS = [
    "admin@sportstwitter.com",
    // Add more admin emails here
];

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if the requesting user is an admin
        if (!ADMIN_EMAILS.includes(session.user.email)) {
            return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
        }

        const body = await request.json();
        const { userId, isVerified } = body;

        if (!userId || typeof isVerified !== "boolean") {
            return NextResponse.json(
                { error: "Missing required fields: userId and isVerified (boolean)" },
                { status: 400 }
            );
        }

        // Update the user's verification status
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isVerified },
            select: {
                id: true,
                name: true,
                email: true,
                isVerified: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: `User ${updatedUser.name || updatedUser.email} is now ${isVerified ? "verified" : "unverified"}`,
            user: updatedUser,
        });
    } catch (error) {
        console.error("Verify user error:", error);
        return NextResponse.json(
            { error: "Failed to update verification status" },
            { status: 500 }
        );
    }
}

// GET endpoint to list all users (for admin management)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!ADMIN_EMAILS.includes(session.user.email)) {
            return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isVerified: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("List users error:", error);
        return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
    }
}
