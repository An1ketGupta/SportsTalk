import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ userId: string }> }
) {
    const params = await props.params;
    try {
        const userId = params.userId;

        const following = await prisma.userFollow.findMany({
            where: { followerId: userId },
            include: {
                following: {
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

        const formattedUsers = following.map((f) => ({
            id: f.following.id,
            name: f.following.name,
            username: f.following.email?.split("@")[0] ?? "user",
            image: f.following.image,
            bio: f.following.bio,
            isVerified: f.following.isVerified,
        }));

        return NextResponse.json({ users: formattedUsers });
    } catch (error) {
        console.error("Get following error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
