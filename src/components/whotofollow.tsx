// components/WhoToFollow.tsx
import { FC } from "react";
import Image from "next/image";

interface User {
  name: string;
  handle: string;
  verified?: boolean;
  avatar: string;
}

const users: User[] = [
  {
    name: "Ayush Singh",
    handle: "@Ayush_cg",
    avatar: "/avatars/ayush.png", // replace with actual path
  },
  {
    name: "Prince Gupta",
    handle: "@codemastercppYT",
    verified: true,
    avatar: "/avatars/prince.png",
  },
  {
    name: "abhinav",
    handle: "@AbhinavXJ",
    verified: true,
    avatar: "/avatars/abhinav.png",
  },
];

const WhoToFollow: FC = () => {
  return (
    <div className="bg-black border border-gray-800 rounded-2xl p-4 w-80">
      <h2 className="text-white text-lg font-bold mb-4">Who to follow</h2>
      <div className="space-y-4">
        {users.map((user, index) => (
          <div
            key={index}
            className="flex items-center justify-between hover:bg-gray-900 p-2 rounded-xl cursor-pointer"
          >
            {/* Avatar */}
            <div className="flex items-center space-x-3">
              <Image
                src={user.avatar}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <span className="text-white font-semibold flex items-center gap-1">
                  {user.name}
                  {user.verified && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-sky-500"
                    >
                      <path d="M22.5 12c0-.6-.3-1.1-.8-1.4l-1.8-1 .3-2c.1-.6-.2-1.2-.8-1.5l-2-1c-.3-.2-.7-.2-1 0l-1.7 1-1.7-1c-.3-.2-.7-.2-1 0l-2 1c-.5.3-.8.9-.8 1.5l.3 2-1.8 1c-.5.3-.8.8-.8 1.4s.3 1.1.8 1.4l1.8 1-.3 2c-.1.6.2 1.2.8 1.5l2 1c.3.2.7.2 1 0l1.7-1 1.7 1c.3.2.7.2 1 0l2-1c.5-.3.8-.9.8-1.5l-.3-2 1.8-1c.5-.3.8-.8.8-1.4zm-12.6 3.7L8 14.8l-1.3 1.3-1.4-1.4L8 12l3.3 3.3-1.4 1.4zm6.8 0l-4-4 1.4-1.4 2.6 2.6 4.6-4.6 1.4 1.4-6 6z" />
                    </svg>
                  )}
                </span>
                <span className="text-gray-500 text-sm">{user.handle}</span>
              </div>
            </div>

            {/* Follow Button */}
            <button className="bg-white text-black font-semibold px-4 py-1 rounded-full hover:bg-gray-300 transition">
              Follow
            </button>
          </div>
        ))}
      </div>
      <button className="text-sky-500 text-sm mt-4 hover:underline">
        Show more
      </button>
    </div>
  );
};

export default WhoToFollow;
