"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdHome, MdSearch, MdNotifications, MdPerson, MdMessage, MdSportsSoccer } from "react-icons/md";

const iconMap = {
    home: MdHome,
    search: MdSearch,
    message: MdMessage,
    bell: MdNotifications,
    user: MdPerson,
    sports: MdSportsSoccer,
};

const menuItems = [
    { label: "Home", icon: "home", path: "/" },
    { label: "Explore", icon: "search", path: "/explore" },
    { label: "Live", icon: "sports", path: "/livematches/nfl" },
    { label: "Alerts", icon: "bell", path: "/notifications" },
    { label: "Messages", icon: "message", path: "/messages" },
    { label: "Profile", icon: "user", path: "/me" },
];

export default function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
            <div className="flex justify-around items-center h-[3.5rem] px-2">
                {menuItems.map((item) => {
                    const Icon = iconMap[item.icon as keyof typeof iconMap] || MdHome;
                    const isActive = pathname === item.path;

                    return (
                        <Link
                            key={item.label}
                            href={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full ${isActive ? "text-white" : "text-gray-500"
                                }`}
                        >
                            <Icon size={28} />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
