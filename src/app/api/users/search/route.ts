import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.length < 2) {
            return NextResponse.json({ users: [] });
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } }, // Rudimentary username search via email
                ],
            },
            take: 5,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isVerified: true,
            },
        });

        const formattedUsers = users.map((u) => ({
            id: u.id,
            name: u.name,
            username: u.email?.split("@")[0] ?? "user",
            image: u.image,
            isVerified: u.isVerified,
        }));

        return NextResponse.json({ users: formattedUsers });
    } catch (error) {
        console.error("Search users error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
