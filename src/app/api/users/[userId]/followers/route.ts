import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const userId = params.userId;

        const followers = await prisma.userFollow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        bio: true,
                        isVerified: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        const formattedUsers = followers.map((f) => ({
            id: f.follower.id,
            name: f.follower.name,
            username: f.follower.email?.split("@")[0] ?? "user",
            image: f.follower.image,
            bio: f.follower.bio,
            isVerified: f.follower.isVerified,
        }));

        return NextResponse.json({ users: formattedUsers });
    } catch (error) {
        console.error("Get followers error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
