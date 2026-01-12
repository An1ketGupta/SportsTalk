// components/WhoToFollow.tsx
"use client";
import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { GoCheckCircleFill } from "react-icons/go";
import { FiRefreshCw } from "react-icons/fi";

interface User {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  followerCount: number;
  postCount: number;
  isFollowing?: boolean;
  reason?: string | null;
}

const WhoToFollow: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSuggestedUsers();
  }, []);

  const loadSuggestedUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const res = await fetch("/api/users/suggested");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (error) {
      console.error("Load users error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const previousState = followingStates[userId] ?? false;
      
      // Optimistic update
      setFollowingStates({
        ...followingStates,
        [userId]: !previousState,
      });

      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });

      if (!res.ok) {
        // Revert on error
        setFollowingStates({
          ...followingStates,
          [userId]: previousState,
        });
        throw new Error("Failed to toggle follow");
      }

      const data = await res.json();
      setFollowingStates({
        ...followingStates,
        [userId]: data.isFollowing,
      });

      // Update user's follower count
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, followerCount: data.followerCount } : u
        )
      );
      
      // If user followed, refresh suggestions after a short delay
      if (data.isFollowing) {
        setTimeout(() => loadSuggestedUsers(true), 1000);
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-black border border-gray-800 rounded-2xl p-4 w-80 mt-4">
        <h2 className="text-white text-lg font-bold mb-4">Who to follow</h2>
        <div className="flex justify-center py-4 text-gray-500">
          <FiRefreshCw className="w-5 h-5 animate-spin" />
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="bg-black border border-gray-800 rounded-2xl p-4 w-80 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-bold">Who to follow</h2>
        <button
          onClick={() => loadSuggestedUsers(true)}
          disabled={refreshing}
          className="p-1.5 hover:bg-gray-800 rounded-full transition-colors"
          title="Refresh suggestions"
        >
          <FiRefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="hover:bg-gray-800/50 p-2 rounded-xl transition-colors"
          >
            <div className="flex items-center justify-between">
              {/* Avatar and Info */}
              <Link
                href={`/user/${user.id}`}
                className="flex items-center space-x-3 flex-1 min-w-0"
              >
                <img
                  src={user.image ?? "/default-avatar.png"}
                  alt={user.name ?? user.username}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex flex-col overflow-hidden min-w-0">
                  <span className="text-white font-semibold flex items-center gap-1 truncate">
                    {user.name ?? user.username}
                    <GoCheckCircleFill className="text-blue-500 flex-shrink-0" />
                  </span>
                  <span className="text-gray-500 text-sm truncate">
                    @{user.username}
                  </span>
                </div>
              </Link>

              {/* Follow Button */}
              <button
                onClick={() => handleFollow(user.id)}
                className={`font-semibold px-4 py-1.5 rounded-full transition-colors flex-shrink-0 text-sm ${
                  followingStates[user.id]
                    ? "bg-transparent border border-gray-600 text-white hover:bg-red-600/10 hover:border-red-600 hover:text-red-600"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {followingStates[user.id] ? "Following" : "Follow"}
              </button>
            </div>
            
            {/* Recommendation Reason */}
            {user.reason && (
              <div className="ml-[52px] mt-1">
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  {user.reason}
                </span>
              </div>
            )}
            
            {/* Stats */}
            {(user.followerCount > 0 || user.postCount > 0) && (
              <div className="ml-[52px] mt-1 flex gap-3 text-xs text-gray-600">
                {user.followerCount > 0 && (
                  <span>{user.followerCount} follower{user.followerCount !== 1 ? "s" : ""}</span>
                )}
                {user.postCount > 0 && (
                  <span>{user.postCount} post{user.postCount !== 1 ? "s" : ""}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => loadSuggestedUsers(true)}
        className="text-blue-500 text-sm mt-4 hover:underline w-full text-left"
      >
        Show more
      </button>
    </div>
  );
};

export default WhoToFollow;
