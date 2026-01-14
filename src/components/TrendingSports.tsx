'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalCache } from "@/context/GlobalCacheContext";

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export default function TrendingSports() {
  const { trendingData, setTrendingData, trendingFetched, setTrendingFetched } = useGlobalCache();
  const [loading, setLoading] = useState(!trendingFetched);
  const router = useRouter();

  useEffect(() => {
    if (!trendingFetched) {
      loadTrends();
    }
  }, [trendingFetched]);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/trending", { cache: 'force-cache' });
      if (!res.ok) throw new Error("Failed to load trends");
      const data = await res.json();
      const newTrends = data.trends ?? [];
      setTrendingData(newTrends);
      setTrendingFetched(true);
    } catch (error) {
      console.error("Load trends error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !trendingData) return null;
  if (!trendingData || trendingData.length === 0) return null;

  return (
    <div className="bg-black mr-10 border border-gray-800 rounded-2xl p-4 w-80 mt-4">
      <h2 className="text-white text-lg font-bold mb-4">Trending</h2>
      <div className="space-y-3">
        {trendingData.map((trend, index) => (
          <button key={trend.tag} onClick={() => router.push(`/community?sport=${encodeURIComponent(trend.tag)}`)} className="w-full text-left hover:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">#{index + 1} Trending</span>
            </div>
            <p className="text-white font-semibold hover:text-blue-400 transition-colors">#{trend.tag}</p>
            <p className="text-gray-500 text-sm">{trend.postCount} post{trend.postCount !== 1 ? "s" : ""}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
