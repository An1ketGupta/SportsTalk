'use client';

import Post, { FeedPost } from "@/components/ui/post";
import Sidebar from "../../components/sidebar";
import TweetBox from "@/components/ui/tweetbox";
import RightSection from "@/components/rightsection";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { FiRefreshCw, FiFilter, FiX, FiUsers, FiStar, FiPlus } from "react-icons/fi";

type Tab = "foryou" | "following";

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

const POSTS_PER_PAGE = 20;

export default function CommunityPage() {
  const searchParams = useSearchParams();
  const [showTweetBox, setTweetBox] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("foryou");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasTriedFollowing, setHasTriedFollowing] = useState<boolean>(false);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Read sport filter from URL params
  useEffect(() => {
    const sportParam = searchParams.get("sport");
    if (sportParam) {
      const formattedSport = sportParam.charAt(0).toUpperCase() + sportParam.slice(1).toLowerCase();
      if (SPORTS_CATEGORIES.includes(formattedSport)) {
        setSelectedSport(formattedSport);
      } else {
        setSelectedSport(sportParam); // Use as-is if not in predefined list
      }
    }
  }, [searchParams]);

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
      params.set("limit", POSTS_PER_PAGE.toString());

      if (tab === "foryou") {
        endpoint = "/api/feed/recommendations";
        if (cursor) params.set("cursor", cursor);
      } else {
        endpoint = "/api/feed";
        params.set("type", "following");
        if (cursor) params.set("cursor", cursor);
      }

      const res = await fetch(`${endpoint}?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to load feed");
      const data = await res.json();

      if (cursor) {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = (data.posts ?? []).filter((p: FeedPost) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore && !loading) {
          loadFeed(activeTab, false, nextCursor);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [nextCursor, loadingMore, loading, activeTab, loadFeed]);

  useEffect(() => {
    if (selectedSport === "All") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(
        posts.filter((p) => {
          if (!p.sport) return false;
          const postTags = p.sport.split(',').map(t => t.trim().toLowerCase());
          return postTags.includes(selectedSport.toLowerCase());
        })
      );
    }
  }, [posts, selectedSport]);

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
    } else {
      loadFeed("foryou");
    }
  }, [activeTab, loadFeed]);

  return (
    <div className="flex w-full h-[90vh] overflow-hidden">
      <div className="hidden md:flex flex-col h-full sticky top-0 overflow-y-auto w-auto border-r border-white/20 scrollbar-hide">
        <Sidebar setAddPost={setTweetBox} />
      </div>

      <div className="flex-1 h-full flex flex-col w-full md:max-w-xl lg:max-w-2xl border-r border-white/20 overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 bg-black/20 backdrop-blur-md border-none flex items-center z-10">
          <Button
            onClick={() => setActiveTab("foryou")}
            className={`${activeTab === "foryou"
              ? "bg-[#dfe6e9] text-black"
              : "bg-black/20 text-white"
              } w-full hover:bg-[#dfe6e9] hover:text-black rounded-sm flex items-center justify-center gap-1`}
          >
            <FiStar className="w-4 h-4" />
            For You
          </Button>

          <Button
            onClick={() => setActiveTab("following")}
            className={`${activeTab === "following"
              ? "bg-[#dfe6e9] text-black"
              : "bg-black/20 text-white"
              } w-full hover:bg-[#dfe6e9] hover:text-black rounded-sm flex items-center justify-center gap-1`}
          >
            <FiUsers className="w-4 h-4" />
            Following
          </Button>
        </div>

        <div className="flex-1 w-full pb-20 md:pb-0">
          <div className="mx-2 mt-2">
            {showTweetBox && <TweetBox onPostCreated={handlePostCreated} />}
          </div>

          <div className="w-full px-2 pb-6 mt-2">
            {loading && (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
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

            {/* Infinite Scroll Sentinel */}
            <div ref={loadMoreRef} className="py-4">
              {loadingMore && (
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* End of Feed Message */}
            {!loading && filteredPosts.length > 0 && !nextCursor && !loadingMore && (
              <div className="flex justify-center py-4 text-gray-500 text-sm">
                You&apos;ve reached the end of the feed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="hidden lg:block h-full overflow-y-auto w-80 xl:w-96 border-l border-white/20 scrollbar-hide">
        <RightSection />
      </div>

      {/* Mobile Tweet FAB */}
      <button
        onClick={() => {
          setTweetBox((prev) => !prev);
          if (!showTweetBox) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className="md:hidden fixed bottom-20 right-4 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg z-50 transition-transform active:scale-95"
      >
        {showTweetBox ? <FiX className="w-6 h-6" /> : <FiPlus className="w-6 h-6" />}
      </button>
    </div>
  );
}
