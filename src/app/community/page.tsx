'use client';

import Post, { FeedPost } from "@/components/ui/post";
import Sidebar from "../../components/sidebar";
import TweetBox from "@/components/ui/tweetbox";
import RightSection from "@/components/rightsection";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { FiRefreshCw, FiFilter, FiX, FiTrendingUp, FiUsers, FiStar } from "react-icons/fi";

type Tab = "foryou" | "following" | "trending";

const SPORTS_CATEGORIES = [
  "All",
  "Football",
  "Basketball",
  "Tennis",
  "Cricket",
  "Baseball",
  "Hockey",
  "Soccer",
  "Golf",
  "Rugby",
];

export default function CommunityPage() {
  const [showTweetBox, setTweetBox] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("foryou");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasTriedFollowing, setHasTriedFollowing] = useState<boolean>(false);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const loadFeed = useCallback(async (tab: Tab, showRefreshing = false, cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      let endpoint: string;
      const params = new URLSearchParams();
      
      if (tab === "foryou") {
        // Use the new recommendation API for "For You"
        endpoint = "/api/feed/recommendations";
        if (cursor) params.set("cursor", cursor);
      } else if (tab === "trending") {
        // Use recommendations sorted by engagement
        endpoint = "/api/feed/recommendations";
        params.set("sort", "trending");
        if (cursor) params.set("cursor", cursor);
      } else {
        // Following feed
        endpoint = "/api/feed";
        params.set("type", "following");
      }
      
      const res = await fetch(`${endpoint}?${params.toString()}`, {
        cache: "no-store",
      });
      
      if (!res.ok) throw new Error("Failed to load feed");
      const data = await res.json();
      
      if (cursor) {
        // Append to existing posts
        setPosts(prev => [...prev, ...(data.posts ?? [])]);
      } else {
        setPosts(data.posts ?? []);
      }
      
      setNextCursor(data.nextCursor ?? null);
      
      if (tab === "following") {
        setHasTriedFollowing(true);
        if (typeof data.followingCount === "number") {
          setFollowingCount(data.followingCount);
        }
      }
    } catch (e) {
      console.error(e);
      if (!cursor) setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) {
      loadFeed(activeTab, false, nextCursor);
    }
  };

  // Apply filter whenever posts or selectedSport changes
  useEffect(() => {
    if (selectedSport === "All") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(
        posts.filter(
          (p) => p.sport?.toLowerCase() === selectedSport.toLowerCase()
        )
      );
    }
  }, [posts, selectedSport]);

  const handleRefresh = () => {
    loadFeed(activeTab, true);
  };

  const handlePostCreated = () => {
    loadFeed(activeTab, true);
    setTweetBox(false);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  useEffect(() => {
    loadFeed("foryou");
  }, [loadFeed]);

  useEffect(() => {
    if (activeTab === "following") {
      loadFeed("following");
    } else if (activeTab === "trending") {
      loadFeed("trending");
    } else {
      loadFeed("foryou");
    }
  }, [activeTab, loadFeed]);

  return (
    <div className="w-full h-[90vh] flex">
      {/* Sidebar */}
      <div>
        <Sidebar setAddPost={setTweetBox} />
      </div>

      {/* Main Content */}
      <div className="border-r max-w-[88vh] border-white border-opacity-20 overflow-y-auto scrollbar-hide flex-1">
        <div className="sticky top-0 bg-black/20 backdrop-blur-md border-none flex items-center z-10">
          <Button
            onClick={() => setActiveTab("foryou")}
            className={`${
              activeTab === "foryou"
                ? "bg-[#dfe6e9] text-black"
                : "bg-black/20 text-white"
            } w-full hover:bg-[#dfe6e9] hover:text-black rounded-sm flex items-center justify-center gap-1`}
          >
            <FiStar className="w-4 h-4" />
            For You
          </Button>

          <Button
            onClick={() => setActiveTab("following")}
            className={`${
              activeTab === "following"
                ? "bg-[#dfe6e9] text-black"
                : "bg-black/20 text-white"
            } w-full hover:bg-[#dfe6e9] hover:text-black rounded-sm flex items-center justify-center gap-1`}
          >
            <FiUsers className="w-4 h-4" />
            Following
          </Button>

          <Button
            onClick={() => setActiveTab("trending")}
            className={`${
              activeTab === "trending"
                ? "bg-[#dfe6e9] text-black"
                : "bg-black/20 text-white"
            } w-full hover:bg-[#dfe6e9] hover:text-black rounded-sm flex items-center justify-center gap-1`}
          >
            <FiTrendingUp className="w-4 h-4" />
            Trending
          </Button>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`p-3 hover:bg-gray-800 transition-colors rounded-full mr-1 ${
                selectedSport !== "All" ? "text-blue-500" : ""
              }`}
              title="Filter by sport"
            >
              <FiFilter className="w-5 h-5" />
            </button>
            {showFilterMenu && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-20 w-48">
                {SPORTS_CATEGORIES.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => {
                      setSelectedSport(sport);
                      setShowFilterMenu(false);
                    }}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors text-sm ${
                      selectedSport === sport ? "bg-blue-500/20 text-blue-400" : "text-white"
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 hover:bg-gray-800 transition-colors rounded-full mr-2"
            title="Refresh feed"
          >
            <FiRefreshCw
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Active Filter Display */}
        {selectedSport !== "All" && (
          <div className="mx-2 mt-2 flex items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
              <span>Filtered: #{selectedSport}</span>
              <button
                onClick={() => setSelectedSport("All")}
                className="hover:bg-blue-500/30 rounded-full p-0.5"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
            <span className="text-gray-500 text-sm">
              {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        <div className="mx-2 mt-2">
          {showTweetBox && <TweetBox onPostCreated={handlePostCreated} />}
        </div>

        <div className="w-full px-2 pb-6 space-y-3 mt-2">
          {loading && (
            <div className="flex justify-center py-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                Loading {activeTab === "foryou" ? "personalized recommendations" : activeTab === "trending" ? "trending posts" : "Following feed"}...
              </div>
            </div>
          )}

          {!loading && filteredPosts.length === 0 && activeTab === "foryou" && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
              <FiStar className="w-12 h-12 mb-4 text-gray-600" />
              <p className="font-semibold text-lg">
                {selectedSport !== "All"
                  ? `No ${selectedSport} posts yet`
                  : "No posts yet"}
              </p>
              <p className="text-sm mt-1">
                Be the first to share what&apos;s happening in sports.
              </p>
            </div>
          )}

          {!loading && filteredPosts.length === 0 && activeTab === "trending" && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
              <FiTrendingUp className="w-12 h-12 mb-4 text-gray-600" />
              <p className="font-semibold text-lg">
                {selectedSport !== "All"
                  ? `No trending ${selectedSport} posts`
                  : "No trending posts yet"}
              </p>
              <p className="text-sm mt-1">
                Check back later to see what&apos;s hot in sports.
              </p>
            </div>
          )}

          {!loading &&
            filteredPosts.length === 0 &&
            activeTab === "following" &&
            hasTriedFollowing && (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                <FiUsers className="w-12 h-12 mb-4 text-gray-600" />
                <p className="font-semibold text-lg">
                  {followingCount === 0
                    ? "You're not following anyone yet"
                    : selectedSport !== "All"
                    ? `No ${selectedSport} posts from people you follow`
                    : "No posts from people you follow"}
                </p>
                <p className="text-sm mt-1 max-w-xs">
                  Follow other fans to see their posts in your Following feed.
                </p>
              </div>
            )}

          {!loading &&
            filteredPosts.map((p) => (
              <Post
                key={p.id}
                post={p}
                onDelete={() => handlePostDeleted(p.id)}
              />
            ))}

          {/* Load More Button */}
          {!loading && filteredPosts.length > 0 && nextCursor && (
            <div className="flex justify-center py-4">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}

          {/* End of Feed Message */}
          {!loading && filteredPosts.length > 0 && !nextCursor && (
            <div className="flex justify-center py-4 text-gray-500 text-sm">
              You&apos;ve reached the end of the feed
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <RightSection />
    </div>
  );
}
