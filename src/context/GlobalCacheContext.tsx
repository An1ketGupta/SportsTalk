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

// Import useToast inside the component file or pass it differently?
// Since we are inside the Provider which is inside ToastProvider, we can use the hook if we import it.
import { useToast } from "@/components/ToastProvider";

export function GlobalCacheProvider({ children }: { children: ReactNode }) {
    const [trendingData, setTrendingData] = useState<any[] | null>(null);
    const [whoToFollowData, setWhoToFollowData] = useState<any[] | null>(null);
    const [trendingFetched, setTrendingFetched] = useState(false);
    const [whoToFollowFetched, setWhoToFollowFetched] = useState(false);
    const [trendingTimestamp, setTrendingTimestamp] = useState<number | null>(null);
    const [whoToFollowTimestamp, setWhoToFollowTimestamp] = useState<number | null>(null);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);

    const { showToast } = useToast();

    // Poll for notifications
    React.useEffect(() => {
        const checkNotifications = async () => {
            try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                    const data = await res.json();
                    const newCount = data.unreadCount ?? 0;
                    const newMessageCount = data.unreadMessageCount ?? 0;

                    // We let the separate effect handle toasts
                    setUnreadNotificationCount(newCount);
                    setUnreadMessageCount(newMessageCount);
                }
            } catch (e) {
                console.error("Failed to check notifications", e);
            }
        };

        // Initial check
        checkNotifications();

        // Poll every 30 seconds
        const interval = setInterval(checkNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Effect to detect increase and show toast
    const prevCountRef = React.useRef(0);
    const prevMessageCountRef = React.useRef(0);
    const isFirstLoadRef = React.useRef(true);

    React.useEffect(() => {
        const checkNotifications = async () => {
            try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                    const data = await res.json();
                    const newCount = data.unreadCount ?? 0;
                    const newMessageCount = data.unreadMessageCount ?? 0;

                    if (!isFirstLoadRef.current) {
                        if (newCount > prevCountRef.current) {
                            showToast(`You have ${newCount - prevCountRef.current} new notification${newCount - prevCountRef.current > 1 ? 's' : ''}!`, "info");
                        }
                        if (newMessageCount > prevMessageCountRef.current) {
                            showToast(`You have ${newMessageCount - prevMessageCountRef.current} new message${newMessageCount - prevMessageCountRef.current > 1 ? 's' : ''}!`, "info");
                        }
                    }

                    setUnreadNotificationCount(newCount);
                    setUnreadMessageCount(newMessageCount);
                    prevCountRef.current = newCount;
                    prevMessageCountRef.current = newMessageCount;
                    isFirstLoadRef.current = false;
                }
            } catch (e) {
                // error
            }
        };

        checkNotifications();
        const interval = setInterval(checkNotifications, 10000); // Check every 10s for faster updates
        return () => clearInterval(interval);
    }, [showToast]);

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
