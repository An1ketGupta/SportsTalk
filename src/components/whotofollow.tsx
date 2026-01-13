'use client'
import { useEffect, useState } from "react";
import Link from "next/link";
import { GoCheckCircleFill } from "react-icons/go";

export default function WhoToFollow() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSuggestedUsers();
  }, []);

  const loadSuggestedUsers = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const res = await fetch("/api/users/suggested");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (error) {
      console.error("Load users error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const previousState = followingStates[userId] ?? false;
      setFollowingStates({ ...followingStates, [userId]: !previousState });

      const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });

      if (!res.ok) {
        setFollowingStates({ ...followingStates, [userId]: previousState });
        throw new Error("Failed to toggle follow");
      }

      const data = await res.json();
      setFollowingStates({ ...followingStates, [userId]: data.isFollowing });
      setUsers(users.map((u) => u.id === userId ? { ...u, followerCount: data.followerCount } : u));

      if (data.isFollowing) {
        setTimeout(() => loadSuggestedUsers(true), 1000);
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  if (loading) return (
    <div className="bg-black border border-gray-800 rounded-2xl p-4 w-full max-w-80 mt-4">
      <h2 className="text-white text-lg font-bold mb-4">Who to follow</h2>
      <div className="flex justify-center py-4 text-gray-500">
        <div className="w-5 h-5 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );

  if (users.length === 0) return null;

  return (
    <div className="bg-black mb-6 border border-gray-800 rounded-2xl p-4 w-full max-w-80 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-bold">Who to follow</h2>
      </div>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="hover:bg-gray-800/50 p-2 rounded-xl transition-colors">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/user/${user.id}`} className="flex items-center space-x-3 flex-1 min-w-0">
                <img src={user.image ?? "/default-avatar.png"} alt={user.name ?? user.username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                  <span className="text-white font-semibold flex items-center gap-1 truncate">
                    <span className="truncate">{user.name ?? user.username}</span>
                    {user.isVerified && <GoCheckCircleFill className="text-blue-500 flex-shrink-0 w-4 h-4" />}
                  </span>
                  <span className="text-gray-500 text-sm truncate">@{user.username}</span>
                </div>
              </Link>
              <button onClick={() => handleFollow(user.id)} className={`font-semibold px-3 py-1.5 rounded-full transition-colors flex-shrink-0 text-sm whitespace-nowrap ${followingStates[user.id] ? "bg-transparent border border-gray-600 text-white hover:bg-red-600/10 hover:border-red-600 hover:text-red-600" : "bg-white text-black hover:bg-gray-200"}`}>
                {followingStates[user.id] ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
