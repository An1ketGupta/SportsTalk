"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchBar from "@/components/ui/searchbar";
import Sidebar from "@/components/sidebar";
import Userpagenavbar from "@/components/ui/ProfilePageNavbar";
import WhoToFollow from "@/components/whotofollow";
import TrendingSports from "@/components/TrendingSports";
import Post, { FeedPost } from "@/components/ui/post";
import EditProfileModal from "@/components/EditProfileModal";
import { GoCheckCircleFill } from "react-icons/go";
import { FiCalendar } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { useToast } from "@/components/ToastProvider";

const POSTS_PER_PAGE = 10;

type TabType = "posts" | "replies" | "likes";

interface UserProfile {
  id: string;
  name: string | null;
  username: string;
  email: string;
  image: string | null;
  bio: string | null;
  coverImage?: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
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
  post: FeedPost;
}

export default function MePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [likedPosts, setLikedPosts] = useState<FeedPost[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [loading, setLoading] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [repliesCursor, setRepliesCursor] = useState<string | null>(null);
  const [likesCursor, setLikesCursor] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMyProfile = useCallback(async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams();
      params.set("limit", POSTS_PER_PAGE.toString());
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/users/me?${params.toString()}`);

      if (res.status === 401) {
        router.push("/auth");
        return;
      }

      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();

      if (!cursor) {
        setUser(data.user);
        setPosts(data.posts ?? []);
      } else {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = (data.posts ?? []).filter((p: FeedPost) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      }
      setNextCursor(data.nextCursor ?? null);
    } catch (error) {
      console.error("Load profile error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [router]);

  const loadMyReplies = useCallback(async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoadingReplies(true);
      }

      const params = new URLSearchParams();
      params.set("limit", POSTS_PER_PAGE.toString());
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/users/me/replies?${params.toString()}`);

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
      setRepliesCursor(data.nextCursor ?? null);
    } catch (error) {
      console.error("Load replies error:", error);
    } finally {
      setLoadingReplies(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMyLikes = useCallback(async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoadingLikes(true);
      }

      const params = new URLSearchParams();
      params.set("limit", POSTS_PER_PAGE.toString());
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/users/me/likes?${params.toString()}`);

      if (!res.ok) throw new Error("Failed to load likes");
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
      setLikesCursor(data.nextCursor ?? null);
    } catch (error) {
      console.error("Load likes error:", error);
    } finally {
      setLoadingLikes(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadMyProfile();
  }, [loadMyProfile]);

  // Load tab data when tab changes
  useEffect(() => {
    if (activeTab === "replies" && replies.length === 0) {
      loadMyReplies();
    } else if (activeTab === "likes" && likedPosts.length === 0) {
      loadMyLikes();
    }
  }, [activeTab, replies.length, likedPosts.length, loadMyReplies, loadMyLikes]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading) {
          if (activeTab === "posts" && nextCursor) {
            loadMyProfile(nextCursor);
          } else if (activeTab === "replies" && repliesCursor) {
            loadMyReplies(repliesCursor);
          } else if (activeTab === "likes" && likesCursor) {
            loadMyLikes(likesCursor);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [activeTab, nextCursor, repliesCursor, likesCursor, loadingMore, loading, loadMyProfile, loadMyReplies, loadMyLikes]);

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId));
    setLikedPosts(likedPosts.filter((p) => p.id !== postId));
  };

  const handleReplyDeleted = async (replyId: string, postId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments/${replyId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete reply");

      setReplies(replies.filter((r) => r.id !== replyId));
    } catch (error) {
      console.error("Delete reply error:", error);
      showToast("Failed to delete reply. Please try again.", "error");
    }
  };

  const handleSaveProfile = async (data: { name: string; bio: string; image?: string; coverImage?: string }) => {
    try {
      const res = await fetch("/api/users/me/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error ?? "Failed to update profile");
      }

      const updatedData = await res.json();
      setUser((prev) =>
        prev
          ? {
            ...prev,
            name: updatedData.user.name,
            bio: updatedData.user.bio,
            image: updatedData.user.image,
            coverImage: updatedData.user.coverImage,
          }
          : null
      );
    } catch (error) {
      throw error;
    }
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
    const diff = Date.now() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const getCurrentCursor = () => {
    switch (activeTab) {
      case "posts": return nextCursor;
      case "replies": return repliesCursor;
      case "likes": return likesCursor;
    }
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case "posts": return posts;
      case "replies": return replies;
      case "likes": return likedPosts;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[90vh] flex text-white pb-16 md:pb-0">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="border-r w-full max-w-[88vh] border-white border-opacity-20 flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <div className="pl-8 overflow-y-auto scrollbar-hide hidden lg:block">
          <SearchBar />
          <TrendingSports />
          <WhoToFollow />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-[90vh] flex text-white pb-16 md:pb-0">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="border-r w-full max-w-[88vh] border-white border-opacity-20 flex-1 flex items-center justify-center">
          <div className="text-gray-400">Please sign in to view your profile</div>
        </div>
        <div className="pl-8 overflow-y-auto scrollbar-hide hidden lg:block">
          <SearchBar />
          <TrendingSports />
          <WhoToFollow />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[90vh] flex text-white pb-16 md:pb-0">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* User profile content */}
      <div className="border-r w-full max-w-[88vh] border-white border-opacity-20 overflow-y-auto scrollbar-hide flex-1">
        <div className="w-full sticky top-0 z-10 bg-black/80 backdrop-blur-md">
          <Userpagenavbar name={user.name ?? user.username} numberofposts={user.postCount} />
        </div>

        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
            {user.coverImage && (
              <img
                src={user.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-4">
            <img
              src={user.image ?? "/default-avatar.svg"}
              alt={user.name ?? user.username}
              className="w-32 h-32 rounded-full border-4 border-black object-cover"
            />
          </div>

          {/* Edit Profile Button */}
          <div className="absolute bottom-4 right-4">
            <button
              onClick={() => setIsEditingProfile(true)}
              disabled={isEditingProfile}
              className="px-6 py-2 rounded-full font-semibold transition-colors bg-transparent border border-gray-600 text-white hover:bg-white/10 disabled:opacity-50"
            >
              {isEditingProfile ? "Editing..." : "Edit profile"}
            </button>
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
            <button className="hover:underline">
              <span className="font-bold text-white">{user.followingCount}</span>{" "}
              <span className="text-gray-500">Following</span>
            </button>
            <button className="hover:underline">
              <span className="font-bold text-white">{user.followerCount}</span>{" "}
              <span className="text-gray-500">Followers</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === "posts"
              ? "text-white border-b-2 border-blue-500"
              : "text-gray-500 hover:bg-gray-900"
              }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("replies")}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === "replies"
              ? "text-white border-b-2 border-blue-500"
              : "text-gray-500 hover:bg-gray-900"
              }`}
          >
            Replies
          </button>
          <button
            onClick={() => setActiveTab("likes")}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === "likes"
              ? "text-white border-b-2 border-blue-500"
              : "text-gray-500 hover:bg-gray-900"
              }`}
          >
            Likes
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="divide-y divide-gray-800">
          {/* Posts Tab */}
          {activeTab === "posts" && (
            <>
              {posts.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  You haven&apos;t posted anything yet
                </div>
              ) : (
                posts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    onDelete={() => handlePostDeleted(post.id)}
                    showDeleteButton={true}
                  />
                ))
              )}
            </>
          )}

          {/* Replies Tab */}
          {activeTab === "replies" && (
            <>
              {loadingReplies ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : replies.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  You haven&apos;t replied to any posts yet
                </div>
              ) : (
                replies.map((reply) => (
                  <div key={reply.id} className="border-b border-gray-800">
                    {/* Reply context - the original post */}
                    <div className="text-xs text-gray-500 px-4 py-2 flex items-center gap-1">
                      <span>Replying to</span>
                      <Link href={`/user/${reply.post.author.id}`} className="text-blue-500 hover:underline">
                        @{reply.post.author.username}
                      </Link>
                    </div>

                    {/* The reply itself */}
                    <div className="px-4 py-2 bg-gray-900/50 rounded-lg mx-2">
                      <div className="flex items-start gap-3">
                        <img
                          src={reply.author.image ?? "/default-avatar.png"}
                          alt={reply.author.name ?? reply.author.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold">{reply.author.name ?? reply.author.username}</span>
                              {reply.author.isVerified && <GoCheckCircleFill className="text-blue-500" />}
                              <span className="text-gray-500">@{reply.author.username}</span>
                              <span className="text-gray-500 text-xs">· {formatTimeAgo(reply.createdAt)}</span>
                            </div>
                            <button
                              onClick={() => handleReplyDeleted(reply.id, reply.post.id)}
                              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                              title="Delete reply"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[15px] mt-1">{reply.content}</p>
                        </div>
                      </div>
                    </div>

                    {/* Original post preview */}
                    <Link href={`/post/${reply.post.id}`} className="block mt-2">
                      <div className="mx-4 p-3 border border-gray-700 rounded-xl hover:bg-gray-900/30 transition-colors">
                        <div className="flex items-center gap-2 text-sm">
                          <img
                            src={reply.post.author.image ?? "/default-avatar.png"}
                            alt={reply.post.author.name ?? reply.post.author.username}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-semibold">{reply.post.author.name ?? reply.post.author.username}</span>
                          <span className="text-gray-500">@{reply.post.author.username}</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1 line-clamp-2">{reply.post.content}</p>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </>
          )}

          {/* Likes Tab */}
          {activeTab === "likes" && (
            <>
              {loadingLikes ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : likedPosts.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  You haven&apos;t liked any posts yet
                </div>
              ) : (
                likedPosts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    onDelete={() => handlePostDeleted(post.id)}
                    showDeleteButton={post.author.id === user.id}
                  />
                ))
              )}
            </>
          )}

          {/* Infinite Scroll Sentinel */}
          <div ref={loadMoreRef} className="py-4">
            {loadingMore && (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* End of Content Message */}
          {!loading && getCurrentItems().length > 0 && !getCurrentCursor() && !loadingMore && (
            <div className="flex justify-center py-4 text-gray-500 text-sm">
              No more {activeTab}
            </div>
          )}
        </div>
      </div>

      <div className="pl-8 overflow-y-auto scrollbar-hide hidden lg:block">
        <SearchBar />
        <TrendingSports />
        <WhoToFollow />
      </div>

      {user && (
        <EditProfileModal
          isOpen={isEditingProfile}
          onClose={() => setIsEditingProfile(false)}
          user={user}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}