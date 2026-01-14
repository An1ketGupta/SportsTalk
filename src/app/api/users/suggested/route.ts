import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Recommendation weights for user suggestions
const USER_WEIGHTS = {
  MUTUAL_FOLLOWERS: 0.4,    // Users followed by people you follow
  SIMILAR_INTERESTS: 0.35,   // Users who post about same sports
  ENGAGEMENT: 0.15,          // Active users with high engagement
  RECENCY: 0.1,              // Recently active users
};

// In-memory cache for suggested users (5 minutes TTL)
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const suggestedUsersCache = new Map<string, { data: any; timestamp: number }>();

// Clean up expired cache entries periodically
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of suggestedUsersCache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      suggestedUsersCache.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupCache, 5 * 60 * 1000);

interface ScoredUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  isVerified: boolean;
  followerCount: number;
  postCount: number;
  score: number;
  reason?: string;
}

// Get suggested users to follow with smart recommendations
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "5");
    const skipCache = searchParams.get("refresh") === "true";

    // Check cache for authenticated users
    if (currentUserId && !skipCache) {
      const cacheKey = `${currentUserId}-${limit}`;
      const cached = suggestedUsersCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json(cached.data);
      }
    }

    if (currentUserId) {
      // Get IDs of users the current user is already following
      const followingRelations = await prisma.userFollow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      const followingIds = new Set(followingRelations.map((f) => f.followingId));

      // Get users followed by people you follow (mutual network)
      const mutualConnections = await prisma.userFollow.findMany({
        where: {
          followerId: { in: Array.from(followingIds) },
          followingId: {
            notIn: [currentUserId, ...Array.from(followingIds)]
          },
        },
        select: {
          followingId: true,
        },
      });

      // Count how many mutual followers each user has
      const mutualFollowerCounts = new Map<string, number>();
      mutualConnections.forEach((rel) => {
        mutualFollowerCounts.set(
          rel.followingId,
          (mutualFollowerCounts.get(rel.followingId) ?? 0) + 1
        );
      });

      // Get user's sport interests based on their posts and likes
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

      const userSportInterests = new Set(
        [...userLikes.map((l) => l.post.sport), ...userPosts.map((p) => p.sport)]
          .filter(Boolean)
      );

      // Get all potential users to suggest
      const potentialUsers = await prisma.user.findMany({
        where: {
          AND: [
            { id: { not: currentUserId } },
            { id: { notIn: Array.from(followingIds) } },
          ],
        },
        take: limit * 4, // Fetch more to have room after scoring
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          createdAt: true,
          isVerified: true,
          posts: {
            select: { sport: true },
            take: 20,
          },
          _count: {
            select: {
              followers: true,
              posts: true,
              likes: true,
            },
          },
        },
      });

      // Score each user
      const scoredUsers: ScoredUser[] = potentialUsers.map((user) => {
        let score = 0;
        const reasons: string[] = [];

        // Mutual followers score
        const mutualCount = mutualFollowerCounts.get(user.id) ?? 0;
        if (mutualCount > 0) {
          score += Math.min(mutualCount / 5, 1) * USER_WEIGHTS.MUTUAL_FOLLOWERS;
          reasons.push(`Followed by ${mutualCount} people you follow`);
        }

        // Similar sports interests
        const userSports = new Set(user.posts.map((p) => p.sport).filter(Boolean));
        const commonSports = [...userSportInterests].filter((s) => userSports.has(s));
        if (commonSports.length > 0) {
          score += (commonSports.length / Math.max(userSportInterests.size, 1)) * USER_WEIGHTS.SIMILAR_INTERESTS;
          reasons.push(`Also interested in ${commonSports[0]}`);
        }

        // Engagement score (activity level)
        const engagementScore = Math.min(
          (user._count.posts + user._count.likes) / 50,
          1
        );
        score += engagementScore * USER_WEIGHTS.ENGAGEMENT;

        // Popularity bonus
        if (user._count.followers > 10) {
          score += 0.1;
          if (!reasons.length) reasons.push("Popular in the community");
        }

        // Recency bonus for new users
        const daysSinceJoin = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceJoin < 30) {
          score += 0.05;
          if (!reasons.length) reasons.push("New to the platform");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          bio: user.bio,
          isVerified: user.isVerified,
          followerCount: user._count.followers,
          postCount: user._count.posts,
          score,
          reason: reasons[0],
        };
      });

      // Sort by score and return top suggestions
      scoredUsers.sort((a, b) => b.score - a.score);

      const responseData = {
        users: scoredUsers.slice(0, limit).map((u) => ({
          id: u.id,
          name: u.name,
          username: u.email?.split("@")[0] ?? "user",
          image: u.image,
          bio: u.bio,
          isVerified: u.isVerified,
          followerCount: u.followerCount,
          postCount: u.postCount,
          reason: u.reason,
        })),
      };

      // Cache the result for 30 minutes
      const cacheKey = `${currentUserId}-${limit}`;
      suggestedUsersCache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now(),
      });

      return NextResponse.json(responseData);
    } else {
      // For non-authenticated users, show popular and active users
      const suggestedUsers = await prisma.user.findMany({
        take: limit,
        orderBy: [
          { followers: { _count: "desc" } },
          { posts: { _count: "desc" } },
        ],
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          isVerified: true,
          _count: {
            select: {
              followers: true,
              posts: true,
            },
          },
        },
      });

      return NextResponse.json({
        users: suggestedUsers.map((u) => ({
          id: u.id,
          name: u.name,
          username: u.email?.split("@")[0] ?? "user",
          image: u.image,
          bio: u.bio,
          isVerified: u.isVerified,
          followerCount: u._count.followers,
          postCount: u._count.posts,
          reason: u._count.followers > 5 ? "Popular in the community" : null,
        })),
      });
    }
  } catch (error) {
    console.error("Get suggested users error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


