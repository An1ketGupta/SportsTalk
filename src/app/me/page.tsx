"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/ui/searchbar";
import Sidebar from "@/components/sidebar";
import Userpagenavbar from "@/components/ui/ProfilePageNavbar";
import WhoToFollow from "@/components/whotofollow";
import TrendingSports from "@/components/TrendingSports";
import Post, { FeedPost } from "@/components/ui/post";
import EditProfileModal from "@/components/EditProfileModal";
import { GoCheckCircleFill } from "react-icons/go";
import { FiCalendar } from "react-icons/fi";

const POSTS_PER_PAGE = 10;

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
}

export default function MePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
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

  useEffect(() => {
    loadMyProfile();
  }, [loadMyProfile]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore && !loading) {
          loadMyProfile(nextCursor);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [nextCursor, loadingMore, loading, loadMyProfile]);

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  const handleSaveProfile = async (data: { name: string; bio: string }) => {
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

  if (loading) {
    return (
      <div className="w-full h-screen flex text-white">
        <div>
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-screen flex text-white">
        <div>
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Please sign in to view your profile</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[90vh] flex text-white">
      <div>
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
          <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>

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
            <GoCheckCircleFill className="text-blue-500 text-xl" />
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
          <button className="flex-1 py-4 text-center font-semibold text-white border-b-2 border-blue-500">
            Posts
          </button>
          <button className="flex-1 py-4 text-center font-semibold text-gray-500 hover:bg-gray-900">
            Replies
          </button>
          <button className="flex-1 py-4 text-center font-semibold text-gray-500 hover:bg-gray-900">
            Media
          </button>
        </div>

        {/* Posts */}
        <div className="px-2 py-2 space-y-3">
          {posts.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-10">
              You haven&apos;t posted anything yet
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
          
          {/* Infinite Scroll Sentinel */}
          <div ref={loadMoreRef} className="py-4">
            {loadingMore && (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* End of Posts Message */}
          {!loading && posts.length > 0 && !nextCursor && !loadingMore && (
            <div className="flex justify-center py-4 text-gray-500 text-sm">
              No more posts
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