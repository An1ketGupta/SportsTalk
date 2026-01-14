"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MdHome, MdSearch, MdNotifications, MdPerson, MdMessage, MdTrendingUp, MdClose, MdLogout } from "react-icons/md";
import { signOut } from "next-auth/react";
import { useGlobalCache } from "@/context/GlobalCacheContext";

const iconMap = {
    home: MdHome,
    search: MdSearch,
    message: MdMessage,
    bell: MdNotifications,
    user: MdPerson,
};

const menuItems = [
    { label: "Home", icon: "home", path: "/community" },
    { label: "Explore", icon: "search", path: "/explore" },
    { label: "Trending", icon: "trending", path: null }, // Special item for trending panel
    { label: "Alerts", icon: "bell", path: "/notifications" },
    { label: "Messages", icon: "message", path: "/messages" },
    { label: "Profile", icon: "user", path: null }, // Changed to null for menu
];

// Cache trending data globally
let cachedTrends: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export default function MobileBottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [showTrending, setShowTrending] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [trends, setTrends] = useState<any[]>(cachedTrends ?? []);
    const [loadingTrends, setLoadingTrends] = useState(false);
    const { unreadNotificationCount, unreadMessageCount } = useGlobalCache();

    // Hide on landing page
    if (pathname === "/") return null;

    const loadTrends = async () => {
        const now = Date.now();
        if (cachedTrends && now - lastFetchTime < CACHE_DURATION) {
            setTrends(cachedTrends);
            return;
        }

        setLoadingTrends(true);
        try {
            const res = await fetch("/api/trending", { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                const newTrends = data.trends ?? [];
                setTrends(newTrends);
                cachedTrends = newTrends;
                lastFetchTime = Date.now();
            }
        } catch (error) {
            console.error("Load trends error:", error);
        } finally {
            setLoadingTrends(false);
        }
    };

    const handleTrendingClick = () => {
        setShowProfileMenu(false);
        setShowTrending(true);
        loadTrends();
    };

    const handleProfileClick = () => {
        setShowTrending(false);
        setShowProfileMenu(true);
    };

    const handleTrendClick = (tag: string) => {
        setShowTrending(false);
        router.push(`/community?sport=${encodeURIComponent(tag)}`);
    };

    const handleLogout = () => {
        setShowProfileMenu(false);
        signOut({ callbackUrl: "/" });
    };

    return (
        <>
            {/* Trending Panel Overlay */}
            {showTrending && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    onClick={() => setShowTrending(false)}
                />
            )}

            {/* Profile Menu Overlay */}
            {showProfileMenu && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    onClick={() => setShowProfileMenu(false)}
                />
            )}

            {/* Trending Slide-up Panel */}
            <div
                className={`md:hidden fixed left-0 right-0 bottom-0 bg-black border-t border-gray-800 rounded-t-3xl z-[70] transform transition-transform duration-300 ease-out ${showTrending ? 'translate-y-0' : 'translate-y-full'
                    }`}
                style={{ maxHeight: '70vh' }}
            >
                <div className="px-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white text-lg font-bold">Trending</h2>
                        <button
                            onClick={() => setShowTrending(false)}
                            className="text-gray-400 hover:text-white p-1"
                        >
                            <MdClose size={24} />
                        </button>
                    </div>

                    {/* Drag handle indicator */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-700 rounded-full" />

                    <div className="space-y-2 overflow-y-auto max-h-[50vh]">
                        {loadingTrends ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : trends.length > 0 ? (
                            trends.map((trend, index) => (
                                <button
                                    key={trend.tag}
                                    onClick={() => handleTrendClick(trend.tag)}
                                    className="w-full text-left hover:bg-gray-800 p-3 rounded-xl transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 text-xs">#{index + 1} Trending</span>
                                    </div>
                                    <p className="text-white font-semibold">#{trend.tag}</p>
                                    <p className="text-gray-500 text-sm">{trend.postCount} post{trend.postCount !== 1 ? "s" : ""}</p>
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No trends available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Menu Slide-up Panel */}
            <div
                className={`md:hidden fixed left-0 right-0 bottom-0 bg-black border-t border-gray-800 rounded-t-3xl z-[70] transform transition-transform duration-300 ease-out ${showProfileMenu ? 'translate-y-0' : 'translate-y-full'
                    }`}
            >
                <div className="px-4 pb-20">
                    {/* Drag handle indicator */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-700 rounded-full" />

                    <div className="flex items-center justify-between mb-4 pt-4">
                        <h2 className="text-white text-lg font-bold">Account</h2>
                        <button
                            onClick={() => setShowProfileMenu(false)}
                            className="text-gray-400 hover:text-white p-1"
                        >
                            <MdClose size={24} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <Link
                            href="/me"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-4 p-4 hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            <MdPerson size={24} className="text-white" />
                            <span className="text-white font-medium">My Profile</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 p-4 hover:bg-gray-800 rounded-xl transition-colors w-full text-left"
                        >
                            <MdLogout size={24} className="text-red-400" />
                            <span className="text-red-400 font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
                <div className="flex justify-around items-center h-[3.5rem] px-2">
                    {menuItems.map((item) => {
                        const isActive = item.path ? pathname === item.path : (item.icon === "trending" ? showTrending : showProfileMenu);

                        // Special handling for Trending button
                        if (item.icon === "trending") {
                            return (
                                <button
                                    key={item.label}
                                    onClick={handleTrendingClick}
                                    className={`flex flex-col items-center justify-center w-full h-full ${isActive ? "text-white" : "text-gray-500"
                                        }`}
                                >
                                    <MdTrendingUp size={28} />
                                </button>
                            );
                        }

                        // Special handling for Profile button
                        if (item.icon === "user") {
                            return (
                                <button
                                    key={item.label}
                                    onClick={handleProfileClick}
                                    className={`flex flex-col items-center justify-center w-full h-full ${isActive ? "text-white" : "text-gray-500"
                                        }`}
                                >
                                    <MdPerson size={28} />
                                </button>
                            );
                        }

                        const Icon = iconMap[item.icon as keyof typeof iconMap] || MdHome;
                        const badgeCount = item.icon === "bell" ? unreadNotificationCount : item.icon === "message" ? unreadMessageCount : 0;

                        return (
                            <Link
                                key={item.label}
                                href={item.path!}
                                className={`flex flex-col items-center justify-center w-full h-full relative ${isActive ? "text-white" : "text-gray-500"
                                    }`}
                            >
                                <div className="relative">
                                    <Icon size={28} />
                                    {badgeCount > 0 && (
                                        <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                            {badgeCount > 9 ? '9+' : badgeCount}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

