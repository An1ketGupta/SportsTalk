import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Recommendation weights
const WEIGHTS = {
  RECENCY: 1.0,           // Base weight for time decay
  ENGAGEMENT: 0.4,         // Weight for likes/comments
  SPORT_INTEREST: 0.3,     // Weight for matching user's sport interests
  SECOND_DEGREE: 0.25,     // Weight for 2nd degree connections (friends of friends)
  VIRAL_BONUS: 0.2,        // Bonus for viral/trending posts
  FOLLOWING_BOOST: 0.5,    // Boost for posts from people you follow
};

// Time decay constants (in hours)
const DECAY_HALF_LIFE = 24; // Score halves every 24 hours

interface ScoredPost {
  id: string;
  content: string;
  createdAt: Date;
  mediaUrl: string | null;
  sport: string | null;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  isLiked: boolean;
  score: number;
  reason?: string;
}

// Calculate time decay factor
function getTimeDecayFactor(createdAt: Date): number {
  const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  return Math.pow(0.5, hoursAgo / DECAY_HALF_LIFE);
}

// Calculate engagement score
function getEngagementScore(likes: number, comments: number): number {
  // Comments are worth more than likes (encourage discussion)
  return (likes + comments * 2) / 10;
}

// Check if post is viral (high engagement relative to age)
function isViral(likes: number, comments: number, hoursAgo: number): boolean {
  if (hoursAgo < 1) return false; // Too new to determine
  const engagementRate = (likes + comments) / Math.max(hoursAgo, 1);
  return engagementRate > 5; // More than 5 engagements per hour
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const cursor = searchParams.get("cursor"); // For pagination

    // Get all recent posts with engagement data
    const posts = await prisma.post.findMany({
      where: cursor ? { createdAt: { lt: new Date(cursor) } } : undefined,
      take: limit * 3, // Fetch more to have room after scoring/filtering
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        likes: currentUserId
          ? {
            where: { userId: currentUserId },
            select: { userId: true },
          }
          : false,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!currentUserId) {
      // For unauthenticated users, use simple engagement-based ranking
      const scoredPosts = posts.map((post) => {
        const timeDecay = getTimeDecayFactor(post.createdAt);
        const engagement = getEngagementScore(post._count.likes, post._count.comments);
        const hoursAgo = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
        const viral = isViral(post._count.likes, post._count.comments, hoursAgo);

        const score =
          timeDecay * WEIGHTS.RECENCY +
          engagement * WEIGHTS.ENGAGEMENT +
          (viral ? WEIGHTS.VIRAL_BONUS : 0);

        return {
          ...post,
          isLiked: false,
          score,
          reason: viral ? "Trending" : undefined,
        };
      });

      scoredPosts.sort((a, b) => b.score - a.score);

      return NextResponse.json({
        posts: scoredPosts.slice(0, limit).map(formatPost),
        nextCursor: scoredPosts.length > limit ? scoredPosts[limit - 1].createdAt.toISOString() : null,
      });
    }

    // For authenticated users, build a personalized feed

    // 1. Get user's following list
    const followingRelations = await prisma.userFollow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    const followingIds = new Set(followingRelations.map((f) => f.followingId));

    // 2. Get 2nd degree connections (people followed by people you follow)
    const secondDegreeRelations = await prisma.userFollow.findMany({
      where: {
        followerId: { in: Array.from(followingIds) },
        followingId: { notIn: [currentUserId, ...Array.from(followingIds)] },
      },
      select: { followingId: true },
    });
    const secondDegreeIds = new Set(secondDegreeRelations.map((f) => f.followingId));

    // 3. Get user's sport interests based on their likes and posts
    const userLikes = await prisma.like.findMany({
      where: { userId: currentUserId },
      include: {
        post: {
          select: { sport: true },
        },
      },
    });

    const userPosts = await prisma.post.findMany({
      where: { authorId: currentUserId },
      select: { sport: true },
    });

    // Build tag interest map (handle comma-separated tags)
    const tagInterests = new Map<string, number>();
    [...userLikes.map((l) => l.post.sport), ...userPosts.map((p) => p.sport)]
      .filter(Boolean)
      .forEach((sport) => {
        // Split by comma to handle multiple tags
        const tags = sport!.split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach((tag) => {
          tagInterests.set(tag, (tagInterests.get(tag) ?? 0) + 1);
        });
      });

    // Normalize tag interests
    const maxInterest = Math.max(...Array.from(tagInterests.values()), 1);
    tagInterests.forEach((value, key) => {
      tagInterests.set(key, value / maxInterest);
    });

    // 4. Score each post
    const scoredPosts: ScoredPost[] = posts.map((post) => {
      const timeDecay = getTimeDecayFactor(post.createdAt);
      const engagement = getEngagementScore(post._count.likes, post._count.comments);
      const hoursAgo = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
      const viral = isViral(post._count.likes, post._count.comments, hoursAgo);

      let score = timeDecay * WEIGHTS.RECENCY + engagement * WEIGHTS.ENGAGEMENT;
      const reasons: string[] = [];

      // Tag interest boost (handle comma-separated tags)
      if (post.sport) {
        const postTags = post.sport.split(',').map(t => t.trim()).filter(Boolean);
        let maxTagScore = 0;
        let matchingTag = '';
        postTags.forEach((tag) => {
          if (tagInterests.has(tag) && tagInterests.get(tag)! > maxTagScore) {
            maxTagScore = tagInterests.get(tag)!;
            matchingTag = tag;
          }
        });
        if (maxTagScore > 0) {
          score += maxTagScore * WEIGHTS.SPORT_INTEREST;
          reasons.push(`Based on your #${matchingTag} interest`);
        }
      }

      // Following boost
      if (followingIds.has(post.authorId)) {
        score += WEIGHTS.FOLLOWING_BOOST;
        reasons.push("From someone you follow");
      }

      // Second degree connection boost
      if (secondDegreeIds.has(post.authorId)) {
        score += WEIGHTS.SECOND_DEGREE;
        reasons.push("Popular in your network");
      }

      // Viral bonus
      if (viral) {
        score += WEIGHTS.VIRAL_BONUS;
        reasons.push("Trending");
      }

      // Don't show user's own posts in recommendations
      if (post.authorId === currentUserId) {
        score = -1;
      }

      return {
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        mediaUrl: post.mediaUrl,
        sport: post.sport,
        authorId: post.authorId,
        author: post.author,
        _count: post._count,
        isLiked: Array.isArray(post.likes) && post.likes.length > 0,
        score,
        reason: reasons[0], // Primary reason for recommendation
      };
    });

    // Sort by score and filter out own posts
    scoredPosts.sort((a, b) => b.score - a.score);
    const filteredPosts = scoredPosts.filter((p) => p.score >= 0);

    return NextResponse.json({
      posts: filteredPosts.slice(0, limit).map(formatPost),
      nextCursor:
        filteredPosts.length > limit
          ? filteredPosts[limit - 1].createdAt.toISOString()
          : null,
      debug: process.env.NODE_ENV === "development" ? {
        followingCount: followingIds.size,
        secondDegreeCount: secondDegreeIds.size,
        tagInterests: Object.fromEntries(tagInterests),
      } : undefined,
    });
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function formatPost(post: ScoredPost) {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    mediaUrl: post.mediaUrl,
    sport: post.sport,
    author: {
      id: post.author.id,
      name: post.author.name,
      image: post.author.image,
      username: post.author.email?.split("@")[0] ?? "user",
    },
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    isLiked: post.isLiked,
    recommendationReason: post.reason,
  };
}
