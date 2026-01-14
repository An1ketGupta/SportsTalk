'use client'

import { MdHome, MdSearch, MdNotifications, MdPerson, MdPostAdd, MdMessage, MdLogout, MdTrendingUp } from "react-icons/md";
import { Button } from "./ui/button";
import sidebarData from "../public/sidebar.json";
import { Dispatch, SetStateAction, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useGlobalCache } from "@/context/GlobalCacheContext";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const iconMap: { [key: string]: any } = {
    "home": MdHome,
    "search": MdSearch,
    "message": MdMessage,
    "bell": MdNotifications,
    "user": MdPerson,
};

export default function Sidebar({
    setAddPost
}: {
    setAddPost?: Dispatch<SetStateAction<boolean>>
}) {
    const pathname = usePathname();
    const isMessagesPage = pathname?.startsWith("/messages");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const { unreadNotificationCount, unreadMessageCount } = useGlobalCache();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return <div className={`flex flex-col items-end xl:items-start w-auto gap-6 pt-4 border-r border-white border-opacity-20 pr-3 pl-3 ${isMessagesPage ? "xl:pl-3 xl:pr-3" : "xl:pl-[16vh] xl:pr-10"} h-[90vh]`}>
        <Button className="hover:bg-[#181818] w-auto h-14 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="size-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
            </svg>
        </Button>

        {sidebarData.menuItems.map((item) => {
            const Icon = iconMap[item.icon];

            return (
                <Link href={item.path} key={item.label} className="relative group">
                    <Button className="w-auto px-3 h-14 hover:bg-[#181818] font-medium" size={"lg"}>
                        <div className="flex gap-3 items-center relative">
                            <div className="relative">
                                <Icon size={'37px'} />
                                {item.label === "Notifications" && unreadNotificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-black">
                                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                                    </span>
                                )}
                                {item.label === "Messages" && unreadMessageCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-black">
                                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                    </span>
                                )}
                            </div>
                            <div className={`transition ease-in-out transition-transform duration-100 hidden ${isMessagesPage ? "" : "xl:block"}`}>{item.label}</div>
                        </div>
                    </Button>
                </Link>
            );
        })}

        <Button onClick={() => {
            if (setAddPost)
                setAddPost((c) => !c)
        }} className="w-auto bg-white text-black px-4 h-14 hover:bg-gray-300 text-lg font-medium">
            <div className="flex gap-3">
                <MdPostAdd size={'28px'} />
                <div className={`hidden ${isMessagesPage ? "" : "xl:block"}`}>Post</div>
            </div>
        </Button>
    </div>
}
