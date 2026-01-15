'use client';

import Post, { FeedPost } from "@/components/ui/post";
import Sidebar from "../../components/sidebar";
import TweetBox from "@/components/ui/tweetbox";
import RightSection from "@/components/rightsection";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiRefreshCw, FiFilter, FiX, FiUsers, FiStar, FiPlus, FiTrendingUp } from "react-icons/fi";
import { useGlobalCache } from "@/context/GlobalCacheContext";
import Loader from "@/components/ui/loader";

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
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [loadMoreNode, setLoadMoreNode] = useState<HTMLDivElement | null>(null);

  const { trendingData, trendingFetched, setTrendingData, setTrendingFetched, trendingTimestamp, setTrendingTimestamp } = useGlobalCache();
  const router = useRouter(); // Ensure useRouter is imported

  // Read sport filter from URL params
  useEffect(() => {
    const sportParam = searchParams.get("sport");
    if (sportParam) {
      if (sportParam === "Trending") {
        setSelectedSport("Trending");
      } else {
        const formattedSport = sportParam.charAt(0).toUpperCase() + sportParam.slice(1).toLowerCase();
        if (SPORTS_CATEGORIES.includes(formattedSport)) {
          setSelectedSport(formattedSport);
        } else {
          setSelectedSport(sportParam); // Use as-is if not in predefined list
        }
      }
    } else {
      setSelectedSport("All");
    }
  }, [searchParams]);

  // Load trends if viewing Trending tab
  useEffect(() => {
    const CACHE_REVALIDATE_MS = 5 * 60 * 1000;
    const now = Date.now();
    const isStale = !trendingTimestamp || (now - trendingTimestamp > CACHE_REVALIDATE_MS);

    if (selectedSport === "Trending" && (!trendingFetched || isStale)) {
      const loadTrends = async () => {
        try {
          // setLoading(true); // Optional: global loading state
          const res = await fetch("/api/trending", { cache: 'no-cache' });
          if (!res.ok) throw new Error("Failed to load trends");
          const data = await res.json();
          setTrendingData(data.trends ?? []);
          setTrendingFetched(true);
          setTrendingTimestamp(Date.now());
        } catch (e) {
          console.error(e);
        }
      };
      loadTrends();
    }
  }, [selectedSport, trendingFetched, trendingTimestamp, setTrendingData, setTrendingFetched, setTrendingTimestamp]);

  useEffect(() => {
    if (selectedSport === "All" || selectedSport === "Trending") {
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

  const loadFeed = useCallback(async (tab: Tab, showRefreshing = false, cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
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
    } catch (e) {
      console.error(e);
      if (!cursor) setPosts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const handlePostCreated = (newPost?: FeedPost) => {
    if (newPost) {
      // Prepend the new post to the feed immediately
      setPosts(prev => [newPost, ...prev]);
    } else {
      // Fallback: refresh the feed if no post data provided
      loadFeed(activeTab, true);
    }
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

  // Infinite scroll with Intersection Observer using callback ref
  useEffect(() => {
    if (!loadMoreNode || !nextCursor || loading || loadingMore || selectedSport === "Trending") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadFeed(activeTab, false, nextCursor);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(loadMoreNode);

    return () => observer.disconnect();
  }, [loadMoreNode, activeTab, nextCursor, loadingMore, loading, loadFeed, selectedSport]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (showTweetBox && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showTweetBox]);

  return (
    <div className="flex w-full h-[90vh] overflow-hidden">
      <div className="hidden md:flex flex-col h-full sticky top-0 overflow-y-auto w-auto border-r border-white/20 scrollbar-hide">
        <Sidebar setAddPost={setTweetBox} />
      </div>

      <div ref={scrollContainerRef} className="flex-1 h-full flex flex-col w-full md:max-w-xl lg:max-w-2xl border-r border-white/20 overflow-y-auto scrollbar-hide">
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
            {loading && posts.length > 0 && (
              <div className="flex justify-center py-6">
                <Loader />
              </div>
            )}

            {/* Main Feed Render Logic */}
            {selectedSport === "Trending" ? (
              <div className="mt-4 space-y-4">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FiTrendingUp className="text-blue-500" />
                  Trends for you
                </h2>

                {trendingData && trendingData.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {trendingData.map((trend, index) => (
                      <div
                        key={trend.tag}
                        onClick={() => router.push(`/community?sport=${encodeURIComponent(trend.tag)}`)}
                        className="bg-[#181818] hover:bg-[#202020] p-4 rounded-xl cursor-pointer transition-all border border-transparent hover:border-gray-700"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-gray-500 text-sm font-medium">
                            #{index + 1} Trending
                          </span>
                        </div>
                        <h3 className="text-white text-lg font-bold mb-1">#{trend.tag}</h3>
                        <p className="text-gray-500 text-sm">
                          {trend.postCount} post{trend.postCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    {loading ? "Loading trends..." : "No trending topics right now."}
                  </div>
                )}
              </div>
            ) : (
              /* Standard Feed View */
              <div>
                {selectedSport !== "All" && (
                  <div className="flex items-center justify-between bg-[#181818] p-3 rounded-lg mb-4">
                    <span className="text-white font-medium">Filtering by: <span className="text-blue-500 font-bold">{selectedSport}</span></span>
                    <button
                      onClick={() => router.push("/community")}
                      className="text-gray-400 hover:text-white"
                    >
                      <FiX />
                    </button>
                  </div>
                )}

                {loading && posts.length === 0 ? (
                  <div className="mt-8 flex justify-center">
                    <Loader />
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-500">
                      {activeTab === "following"
                        ? "You do not follow anyone."
                        : "Be the first to post something!"}
                    </p>
                  </div>
                ) : (
                  <>
                    {filteredPosts.map((post) => (
                      <Post key={post.id} post={post} onDelete={() => handlePostDeleted(post.id)} />
                    ))}

                    {/* Infinite Scroll Loader */}
                    <div ref={setLoadMoreNode} className={`h-20 flex items-center justify-center ${!nextCursor ? 'hidden' : ''}`}>
                      {loadingMore && (
                        <Loader size="sm" />
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

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
