import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = {
    params: Promise<{
        userId: string;
    }>;
};

// Get posts that user has liked
export async function GET(req: NextRequest, { params }: Params) {
    try {
        const session = await auth();
        const currentUserId = session?.user?.id;

        const { userId } = await params;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") ?? "10");
        const cursor = searchParams.get("cursor");

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ posts: [], nextCursor: null });
        }

        // Fetch likes by this user (using the Like model)
        const likes = await prisma.like.findMany({
            where: {
                userId: userId,
                ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
            },
            take: limit + 1,
            include: {
                post: {
                    include: {
                        author: {
                            select: { id: true, name: true, image: true, email: true, isVerified: true },
                        },
                        likes: currentUserId ? {
                            where: { userId: currentUserId },
                            select: { userId: true },
                        } : false,
                        _count: {
                            select: { likes: true, comments: true },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const hasMore = likes.length > limit;
        const likesToReturn = hasMore ? likes.slice(0, limit) : likes;
        const nextCursor = hasMore && likesToReturn.length > 0
            ? likesToReturn[likesToReturn.length - 1].createdAt.toISOString()
            : null;

        return NextResponse.json({
            posts: likesToReturn.map((like) => ({
                id: like.post.id,
                content: like.post.content,
                createdAt: like.post.createdAt,
                mediaUrl: like.post.mediaUrl,
                sport: like.post.sport,
                author: {
                    id: like.post.author.id,
                    name: like.post.author.name,
                    image: like.post.author.image,
                    username: like.post.author.email?.split("@")[0] ?? "user",
                    isVerified: like.post.author.isVerified,
                },
                likeCount: like.post._count.likes,
                commentCount: like.post._count.comments,
                isLiked: Array.isArray(like.post.likes) && like.post.likes.length > 0,
                likedAt: like.createdAt,
            })),
            nextCursor,
        });
    } catch (error) {
        console.error("Get user likes error:", error);
        return NextResponse.json(
            { posts: [], nextCursor: null, error: "Failed to load likes" },
            { status: 200 }
        );
    }
}
