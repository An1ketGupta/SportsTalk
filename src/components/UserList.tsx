"use client";

import Link from "next/link";
import { GoCheckCircleFill } from "react-icons/go";

interface UserListProps {
    users: {
        id: string;
        name: string | null;
        username: string;
        image: string | null;
        isVerified?: boolean;
        bio?: string | null;
    }[];
    emptyMessage?: string;
}

export default function UserList({ users, emptyMessage = "No users found." }: UserListProps) {
    if (users.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-800">
            {users.map((user) => (
                <Link
                    key={user.id}
                    href={`/user/${user.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer"
                >
                    <img
                        src={user.image ?? "/default-avatar.png"}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-white truncate">
                                {user.name ?? user.username}
                            </span>
                            {user.isVerified && <GoCheckCircleFill className="text-blue-500 w-4 h-4" />}
                        </div>
                        <div className="text-gray-500 text-sm truncate">@{user.username}</div>
                        {user.bio && (
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{user.bio}</p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
}
