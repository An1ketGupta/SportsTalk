"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface GlobalCacheContextType {
    trendingData: any[] | null;
    setTrendingData: (data: any[]) => void;
    whoToFollowData: any[] | null;
    setWhoToFollowData: (data: any[]) => void;
    trendingFetched: boolean;
    setTrendingFetched: (fetched: boolean) => void;
    whoToFollowFetched: boolean;
    setWhoToFollowFetched: (fetched: boolean) => void;
}

const GlobalCacheContext = createContext<GlobalCacheContextType | undefined>(undefined);

export function GlobalCacheProvider({ children }: { children: ReactNode }) {
    const [trendingData, setTrendingData] = useState<any[] | null>(null);
    const [whoToFollowData, setWhoToFollowData] = useState<any[] | null>(null);
    const [trendingFetched, setTrendingFetched] = useState(false);
    const [whoToFollowFetched, setWhoToFollowFetched] = useState(false);

    return (
        <GlobalCacheContext.Provider
            value={{
                trendingData,
                setTrendingData,
                whoToFollowData,
                setWhoToFollowData,
                trendingFetched,
                setTrendingFetched,
                whoToFollowFetched,
                setWhoToFollowFetched,
            }}
        >
            {children}
        </GlobalCacheContext.Provider>
    );
}

export function useGlobalCache() {
    const context = useContext(GlobalCacheContext);
    if (context === undefined) {
        throw new Error("useGlobalCache must be used within a GlobalCacheProvider");
    }
    return context;
}
