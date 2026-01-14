"use client";

import { useGlobalCache } from "@/context/GlobalCacheContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiTrendingUp } from "react-icons/fi";

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export default function SidebarTrending() {
    const { trendingData, setTrendingData, trendingFetched, setTrendingFetched } = useGlobalCache();
    const [loading, setLoading] = useState(!trendingFetched);

    useEffect(() => {
        if (!trendingFetched) {
            loadTrends();
        }
    }, [trendingFetched]);

    const loadTrends = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/trending", { cache: "force-cache" });
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

    // Show only top 3 items for compact view
    const topTrends = trendingData.slice(0, 3);

    return (
        <div className="mt-6 w-full hidden xl:block">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                    <FiTrendingUp className="text-blue-500" />
                    Trending
                </h3>
                <div className="space-y-2">
                    {topTrends.map((trend) => (
                        <Link
                            key={trend.tag}
                            href={`/community?sport=${encodeURIComponent(trend.tag)}`}
                            className="block hover:bg-white/5 px-2 py-1 rounded transition-colors"
                        >
                            <div className="text-white text-sm font-semibold">#{trend.tag}</div>
                            <div className="text-gray-500 text-xs">{trend.postCount} posts</div>
                        </Link>
                    ))}
                </div>
                <Link href="/community" className="text-blue-400 text-xs mt-2 block hover:underline">
                    <small>Show more</small>
                </Link>
            </div>
        </div>
    );
}
