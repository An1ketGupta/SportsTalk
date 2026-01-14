"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { MdPerson, MdLogout } from "react-icons/md";

export default function ProfileMenu({ user }: { user: any }) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
                <img
                    className="h-10 w-10 rounded-full object-cover border border-white/10"
                    src={user.image ?? "/default-avatar.png"}
                    alt={user.name ?? "User"}
                />
            </button>

            {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                    <Link
                        href="/me"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-white"
                    >
                        <MdPerson size={20} />
                        <span>My Profile</span>
                    </Link>
                    <button
                        onClick={() => {
                            setShowMenu(false);
                            signOut({ callbackUrl: "/" });
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-red-400 w-full text-left border-t border-white/5"
                    >
                        <MdLogout size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}
