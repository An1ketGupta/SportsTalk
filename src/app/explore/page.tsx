"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "../../components/sidebar";
import RightSection from "@/components/rightsection";
import Post, { FeedPost } from "@/components/ui/post";
import { FiSearch, FiUsers } from "react-icons/fi";
import { GoCheckCircleFill } from "react-icons/go";
import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";

interface SearchUser {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  followerCount: number;
}

type SearchTab = "posts" | "users";

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<SearchTab>("posts");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam);
      handleSearch(queryParam);
    }
  }, [queryParam]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);

      const res = await fetch(
        `/api/explore/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setPosts(data.posts ?? []);
      setUsers(data.users ?? []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const previousState = followingStates[userId] ?? false;

      setFollowingStates({
        ...followingStates,
        [userId]: !previousState,
      });

      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });

      if (!res.ok) {
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
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="hidden md:flex flex-col h-full sticky top-0 overflow-y-auto w-auto border-r border-white/20">
        <Sidebar />
      </div>

      <div className="flex-1 h-full flex flex-col w-full md:max-w-xl lg:max-w-2xl border-r border-white/20 overflow-y-auto scrollbar-hide pb-20 md:pb-0">
        {/* Search Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 p-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch(query);
                }
              }}
              placeholder="Search posts and users..."
              className="w-full bg-gray-900 rounded-full pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex mt-4 border-b border-gray-800">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-3 text-center font-semibold transition-colors ${activeTab === "posts"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-500 hover:bg-gray-900"
                }`}
            >
              Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-3 text-center font-semibold transition-colors ${activeTab === "users"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-500 hover:bg-gray-900"
                }`}
            >
              Users ({users.length})
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="px-2 py-2">
          {loading && (
            <div className="text-center text-gray-500 py-10">Searching...</div>
          )}

          {!loading && !hasSearched && (
            <div className="text-center text-gray-500 py-10">
              <FiSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Search for posts, users, or topics</p>
            </div>
          )}

          {!loading && hasSearched && activeTab === "posts" && (
            <>
              {posts.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  No posts found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <Post key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && hasSearched && activeTab === "users" && (
            <>
              {users.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <FiUsers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No users found for &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-900 transition-colors rounded-xl"
                    >
                      <Link
                        href={`/user/${user.id}`}
                        className="flex items-center gap-3 flex-1"
                      >
                        <img
                          src={user.image ?? "/default-avatar.svg"}
                          alt={user.name ?? user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white">
                              {user.name ?? user.username}
                            </span>
                            <GoCheckCircleFill className="text-blue-500" />
                          </div>
                          <p className="text-gray-500 text-sm">@{user.username}</p>
                          {user.bio && (
                            <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                              {user.bio}
                            </p>
                          )}
                          <p className="text-gray-600 text-xs mt-1">
                            {user.followerCount} followers
                          </p>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleFollow(user.id)}
                        className={`px-4 py-2 rounded-full font-semibold transition-colors ${followingStates[user.id]
                          ? "bg-transparent border border-gray-600 text-white hover:bg-red-600/10 hover:border-red-600 hover:text-red-600"
                          : "bg-white text-black hover:bg-gray-200"
                          }`}
                      >
                        {followingStates[user.id] ? "Following" : "Follow"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="hidden lg:block h-full overflow-y-auto w-80 xl:w-96 border-l border-white/20 scrollbar-hide">
        <RightSection />
      </div>

      <MobileBottomNav />
    </div>
  );
}
