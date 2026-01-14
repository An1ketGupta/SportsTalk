"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Userpagenavbar from "@/components/ui/ProfilePageNavbar";
import Post, { FeedPost } from "@/components/ui/post";
import { GoCheckCircleFill } from "react-icons/go";
import Loader from "@/components/ui/loader";
import { FiCalendar, FiMessageCircle, FiHeart } from "react-icons/fi";

const POSTS_PER_PAGE = 10;

type TabType = "posts" | "replies" | "likes";

interface UserProfile {
  id: string;
  name: string | null;
  username: string;
  email: string;
  image: string | null;
  bio: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
  isVerified: boolean;
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    username: string;
    isVerified: boolean;
  };
  likeCount: number;
  replyCount: number;
  isLiked: boolean;
  parentPost: FeedPost;
}

export default function Userpage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userid?.[0] as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [likedPosts, setLikedPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [loadingTab, setLoadingTab] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadUserProfile = useCallback(async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      params.set("limit", POSTS_PER_PAGE.toString());
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/users/${userId}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load user");
      const data = await res.json();

      if (!cursor) {
        setUser(data.user);
        setPosts(data.posts ?? []);
        setIsFollowing(data.user.isFollowing);
        setFollowerCount(data.user.followerCount);
      } else {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = (data.posts ?? []).filter((p: FeedPost) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      }
      setNextCursor(data.nextCursor ?? null);
    } catch (error) {
      console.error("Load user error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId]);

  const loadReplies = useCallback(async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoadingTab(true);
      }

      const params = new URLSearchParams();
      params.set("limit", POSTS_PER_PAGE.toString());
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/users/${userId}/replies?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load replies");
      const data = await res.json();

      if (!cursor) {
        setReplies(data.replies ?? []);
      } else {
        setReplies(prev => {
          const existingIds = new Set(prev.map(r => r.id));
          const newReplies = (data.replies ?? []).filter((r: Reply) => !existingIds.has(r.id));
          return [...prev, ...newReplies];
        });
      }
      setNextCursor(data.nextCursor ?? null);
    } catch (error) {
      console.error("Load replies error:", error);
    } finally {
      setLoadingMore(false);
      setLoadingTab(false);
    }
  }, [userId]);

  const loadLikedPosts = useCallback(async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoadingTab(true);
      }

      const params = new URLSearchParams();
      params.set("limit", POSTS_PER_PAGE.toString());
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/users/${userId}/likes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load liked posts");
      const data = await res.json();

      if (!cursor) {
        setLikedPosts(data.posts ?? []);
      } else {
        setLikedPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = (data.posts ?? []).filter((p: FeedPost) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      }
      setNextCursor(data.nextCursor ?? null);
    } catch (error) {
      console.error("Load liked posts error:", error);
    } finally {
      setLoadingMore(false);
      setLoadingTab(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId, loadUserProfile]);

  // Load content when tab changes
  useEffect(() => {
    if (!userId) return;

    setNextCursor(null);

    if (activeTab === "posts") {
      loadUserProfile();
    } else if (activeTab === "replies") {
      loadReplies();
    } else if (activeTab === "likes") {
      loadLikedPosts();
    }
  }, [activeTab, userId]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore && !loading) {
          if (activeTab === "posts") {
            loadUserProfile(nextCursor);
          } else if (activeTab === "replies") {
            loadReplies(nextCursor);
          } else if (activeTab === "likes") {
            loadLikedPosts(nextCursor);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [nextCursor, loadingMore, loading, activeTab, loadUserProfile, loadReplies, loadLikedPosts]);

  const handleFollow = async () => {
    try {
      const previousState = isFollowing;
      const previousCount = followerCount;

      // Optimistic update
      setIsFollowing(!isFollowing);
      setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1);

      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });

      if (!res.ok) {
        // Revert on error
        setIsFollowing(previousState);
        setFollowerCount(previousCount);
        throw new Error("Failed to toggle follow");
      }

      const data = await res.json();
      setIsFollowing(data.isFollowing);
      setFollowerCount(data.followerCount);
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId));
    setLikedPosts(likedPosts.filter((p) => p.id !== postId));
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const handleTabChange = (tab: TabType) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      // Reset content for new tab
      if (tab === "replies") {
        setReplies([]);
      } else if (tab === "likes") {
        setLikedPosts([]);
      }
    }
  };

  const renderContent = () => {
    if (activeTab === "posts") {
      return (
        <>
          {posts.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-10">
              No posts yet
            </div>
          ) : (
            posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                onDelete={() => handlePostDeleted(post.id)}
              />
            ))
          )}
        </>
      );
    }

    if (activeTab === "replies") {
      if (loadingTab) {
        return (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        );
      }
      return (
        <>
          {replies.length === 0 && !loadingMore ? (
            <div className="text-center text-gray-500 py-10">
              <FiMessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No replies yet</p>
            </div>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="border-b border-white/10">
                {/* Parent post preview */}
                <div
                  className="px-4 py-3 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors"
                  onClick={() => router.push(`/post/${reply.parentPost.id}`)}
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span>Replying to</span>
                    <span className="text-blue-400">@{reply.parentPost.author.username}</span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{reply.parentPost.content}</p>
                </div>
                {/* Reply content */}
                <div className="px-4 py-3">
                  <div className="flex gap-3">
                    <img
                      src={reply.author.image ?? "/default-avatar.svg"}
                      alt={reply.author.name ?? reply.author.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{reply.author.name}</span>
                        {reply.author.isVerified && <GoCheckCircleFill className="text-blue-500 text-sm" />}
                        <span className="text-gray-500 text-sm">@{reply.author.username}</span>
                        <span className="text-gray-600">·</span>
                        <span className="text-gray-500 text-sm">{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                      <p className="text-white mt-1">{reply.content}</p>
                      <div className="flex items-center gap-6 mt-3 text-gray-500 text-sm">
                        <div className="flex items-center gap-1">
                          <FiHeart className={reply.isLiked ? "text-red-500 fill-red-500" : ""} />
                          <span>{reply.likeCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiMessageCircle />
                          <span>{reply.replyCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      );
    }

    if (activeTab === "likes") {
      if (loadingTab) {
        return (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        );
      }
      return (
        <>
          {likedPosts.length === 0 && !loadingMore ? (
            <div className="text-center text-gray-500 py-10">
              <FiHeart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No liked posts yet</p>
            </div>
          ) : (
            likedPosts.map((post) => (
              <Post
                key={post.id}
                post={post}
                onDelete={() => handlePostDeleted(post.id)}
              />
            ))
          )}
        </>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16 mx-auto mb-4 opacity-50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <p className="text-lg">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full sticky top-0 z-10 bg-black/80 backdrop-blur-md">
        <Userpagenavbar name={user.name ?? user.username} numberofposts={user.postCount} />
      </div>

      {/* Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>

        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-4">
          <img
            src={user.image ?? "/default-avatar.svg"}
            alt={user.name ?? user.username}
            className="w-32 h-32 rounded-full border-4 border-black object-cover"
          />
        </div>

        {/* Action Button */}
        <div className="absolute top-52 right-4">
          {user.isOwnProfile ? (
            <button
              onClick={() => router.push("/me")}
              className="px-6 py-2 rounded-full font-semibold transition-colors bg-transparent border border-gray-600 text-white hover:bg-white/10"
            >
              Edit profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/messages?userId=${user.id}`)}
                className="p-2 rounded-full font-semibold transition-colors bg-transparent border border-gray-600 text-white hover:bg-white/10"
                title="Message"
              >
                <FiMessageCircle className="w-5 h-5" />
              </button>
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${isFollowing
                  ? "bg-transparent border border-gray-600 text-white hover:bg-red-600/10 hover:border-red-600 hover:text-red-600"
                  : "bg-white text-black hover:bg-gray-200"
                  }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 pt-20 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            {user.name ?? user.username}
          </h1>
          {user.isVerified && <GoCheckCircleFill className="text-blue-500 text-xl" />}
        </div>
        <p className="text-gray-500">@{user.username}</p>

        {user.bio && (
          <p className="mt-3 text-gray-200">{user.bio}</p>
        )}

        <div className="flex items-center gap-4 mt-3 text-gray-500 text-sm">
          <div className="flex items-center gap-1">
            <FiCalendar />
            <span>Joined {formatJoinDate(user.createdAt)}</span>
          </div>
        </div>

        <div className="flex gap-4 mt-3 text-sm">
          <Link href={`/user/${user.id}/following`} className="hover:underline">
            <span className="font-bold text-white">{user.followingCount}</span>{" "}
            <span className="text-gray-500">Following</span>
          </Link>
          <Link href={`/user/${user.id}/followers`} className="hover:underline">
            <span className="font-bold text-white">{followerCount}</span>{" "}
            <span className="text-gray-500">Followers</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => handleTabChange("posts")}
          className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === "posts"
            ? "text-white border-b-2 border-blue-500"
            : "text-gray-500 hover:bg-gray-900"
            }`}
        >
          Posts
        </button>
        <button
          onClick={() => handleTabChange("replies")}
          className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === "replies"
            ? "text-white border-b-2 border-blue-500"
            : "text-gray-500 hover:bg-gray-900"
            }`}
        >
          Replies
        </button>
        <button
          onClick={() => handleTabChange("likes")}
          className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === "likes"
            ? "text-white border-b-2 border-blue-500"
            : "text-gray-500 hover:bg-gray-900"
            }`}
        >
          Likes
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="px-2 py-2">
        {renderContent()}

        {/* Infinite Scroll Sentinel */}
        <div ref={loadMoreRef} className="py-4">
          {loadingMore && (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* End of Content Message */}
        {!loading && !loadingMore && !nextCursor && (
          (activeTab === "posts" && posts.length > 0) ||
          (activeTab === "replies" && replies.length > 0) ||
          (activeTab === "likes" && likedPosts.length > 0)
        ) && (
            <div className="flex justify-center py-4 text-gray-500 text-sm">
              No more {activeTab}
            </div>
          )}
      </div>
    </>
  );
}