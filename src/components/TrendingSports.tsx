"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TrendingItem {
  tag: string;
  postCount: number;
}

export default function TrendingSports() {
  const [trends, setTrends] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      const res = await fetch("/api/trending");
      if (!res.ok) throw new Error("Failed to load trends");
      const data = await res.json();
      setTrends(data.trends ?? []);
    } catch (error) {
      console.error("Load trends error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrendClick = (tag: string) => {
    // Navigate to community page with the tag filter
    router.push(`/community?sport=${encodeURIComponent(tag)}`);
  };

  if (loading || trends.length === 0) {
    return null;
  }

  return (
    <div className="bg-black border border-gray-800 rounded-2xl p-4 w-80 mt-4">
      <h2 className="text-white text-lg font-bold mb-4">Trending</h2>
      <div className="space-y-3">
        {trends.map((trend, index) => (
          <button
            key={trend.tag}
            onClick={() => handleTrendClick(trend.tag)}
            className="w-full text-left hover:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">#{index + 1} Trending</span>
            </div>
            <p className="text-white font-semibold hover:text-blue-400 transition-colors">#{trend.tag}</p>
            <p className="text-gray-500 text-sm">
              {trend.postCount} post{trend.postCount !== 1 ? "s" : ""}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
