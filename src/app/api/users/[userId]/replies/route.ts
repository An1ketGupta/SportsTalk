import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = {
    params: Promise<{
        userId: string;
    }>;
};

// Get user's replies (comments on posts)
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
            select: { id: true, name: true, image: true, email: true, isVerified: true },
        });

        if (!user) {
            return NextResponse.json({ replies: [], nextCursor: null });
        }

        // Fetch comments by this user with the parent post
        const comments = await prisma.comment.findMany({
            where: {
                authorId: userId,
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

        const hasMore = comments.length > limit;
        const commentsToReturn = hasMore ? comments.slice(0, limit) : comments;
        const nextCursor = hasMore && commentsToReturn.length > 0
            ? commentsToReturn[commentsToReturn.length - 1].createdAt.toISOString()
            : null;

        return NextResponse.json({
            replies: commentsToReturn.map((comment) => ({
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                author: {
                    id: user.id,
                    name: user.name,
                    image: user.image,
                    username: user.email?.split("@")[0] ?? "user",
                    isVerified: user.isVerified,
                },
                likeCount: 0, // Comments don't have likes in this schema
                replyCount: 0, // Comments don't have nested replies in this schema
                isLiked: false,
                // Include the parent post info
                parentPost: {
                    id: comment.post.id,
                    content: comment.post.content,
                    createdAt: comment.post.createdAt,
                    mediaUrl: comment.post.mediaUrl,
                    sport: comment.post.sport,
                    author: {
                        id: comment.post.author.id,
                        name: comment.post.author.name,
                        image: comment.post.author.image,
                        username: comment.post.author.email?.split("@")[0] ?? "user",
                        isVerified: comment.post.author.isVerified,
                    },
                    likeCount: comment.post._count.likes,
                    commentCount: comment.post._count.comments,
                    isLiked: Array.isArray(comment.post.likes) && comment.post.likes.length > 0,
                },
            })),
            nextCursor,
        });
    } catch (error) {
        console.error("Get user replies error:", error);
        return NextResponse.json(
            { replies: [], nextCursor: null, error: "Failed to load replies" },
            { status: 200 }
        );
    }
}
