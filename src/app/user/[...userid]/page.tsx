"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SearchBar from "@/components/ui/searchbar";
import Sidebar from "@/components/sidebar";
import Userpagenavbar from "@/components/ui/ProfilePageNavbar";
import WhoToFollow from "@/components/whotofollow";
import TrendingSports from "@/components/TrendingSports";
import Post, { FeedPost } from "@/components/ui/post";
import { GoCheckCircleFill } from "react-icons/go";
import { FiCalendar, FiMapPin } from "react-icons/fi";

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
}

export default function Userpage() {
  const params = useParams();
  const userId = params?.userid?.[0] as string;
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"posts" | "likes">("posts");

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to load user");
      const data = await res.json();
      setUser(data.user);
      setPosts(data.posts ?? []);
      setIsFollowing(data.user.isFollowing);
      setFollowerCount(data.user.followerCount);
    } catch (error) {
      console.error("Load user error:", error);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="text-gray-400">Loading profile...</div>
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
          <div className="text-gray-400">User not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[90vh] flex text-white">
      <div>
        <Sidebar />
      </div>
      {/* The user profile will be rendered here */}
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

          {/* Follow Button */}
          <div className="absolute bottom-4 right-4">
            {!user.isOwnProfile && (
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                  isFollowing
                    ? "bg-transparent border border-gray-600 text-white hover:bg-red-600/10 hover:border-red-600 hover:text-red-600"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
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
              <span className="font-bold text-white">{followerCount}</span>{" "}
              <span className="text-gray-500">Followers</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${
              activeTab === "posts"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-500 hover:bg-gray-900"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("likes")}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${
              activeTab === "likes"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-500 hover:bg-gray-900"
            }`}
          >
            Likes
          </button>
        </div>

        {/* Posts */}
        <div className="px-2 py-2 space-y-3">
          {posts.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              {activeTab === "posts"
                ? "No posts yet"
                : "No liked posts yet"}
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
        </div>
      </div>

      <div className="pl-8 overflow-y-auto scrollbar-hide hidden lg:block">
        <SearchBar />
        <TrendingSports />
        <WhoToFollow />
      </div>
    </div>
  );
}