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
    trendingTimestamp: number | null;
    setTrendingTimestamp: (ts: number | null) => void;
    whoToFollowTimestamp: number | null;
    setWhoToFollowTimestamp: (ts: number | null) => void;
    unreadNotificationCount: number;
    setUnreadNotificationCount: (count: number) => void;
    unreadMessageCount: number;
    setUnreadMessageCount: (count: number) => void;
}

const GlobalCacheContext = createContext<GlobalCacheContextType | undefined>(undefined);

export function GlobalCacheProvider({ children }: { children: ReactNode }) {
    const [trendingData, setTrendingData] = useState<any[] | null>(null);
    const [whoToFollowData, setWhoToFollowData] = useState<any[] | null>(null);
    const [trendingFetched, setTrendingFetched] = useState(false);
    const [whoToFollowFetched, setWhoToFollowFetched] = useState(false);
    const [trendingTimestamp, setTrendingTimestamp] = useState<number | null>(null);
    const [whoToFollowTimestamp, setWhoToFollowTimestamp] = useState<number | null>(null);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);

    // Poll for notifications
    React.useEffect(() => {
        const checkNotifications = async () => {
            try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                    const data = await res.json();
                    setUnreadNotificationCount(data.unreadCount ?? 0);
                    setUnreadMessageCount(data.unreadMessageCount ?? 0);
                }
            } catch (e) {
                console.error("Failed to check notifications", e);
            }
        };

        checkNotifications();
        const interval = setInterval(checkNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

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
                trendingTimestamp,
                setTrendingTimestamp,
                whoToFollowTimestamp,
                setWhoToFollowTimestamp,
                unreadNotificationCount,
                setUnreadNotificationCount,
                unreadMessageCount,
                setUnreadMessageCount,
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
