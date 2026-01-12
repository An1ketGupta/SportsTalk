import React from "react";

export default function MyProfilePage() {
  return (
    <div className="flex-1 max-w-[88vh] text-white overflow-y-auto h-[90vh] scrollbar-hide border-x border-white/10">
      <div className="sticky top-0 z-20 backdrop-blur bg-black/60">
        <div className="flex items-center gap-4 px-4 py-2">
          <button className="p-2 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <div className="text-lg font-extrabold leading-5">Aniket Gupta</div>
            <div className="text-xs text-neutral-400">0 posts</div>
          </div>
        </div>
      </div>

      <div className="w-full h-52 bg-neutral-800 relative">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop"
          alt="cover"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="px-4 relative">
        <div className="-mt-16 flex items-end justify-between">
          <div className="flex items-end gap-4">
            <div className="w-32 h-32 rounded-full ring-4 ring-black overflow-hidden bg-neutral-700">
              <img
                src="https://ui-avatars.com/api/?name=Aniket+Gupta&background=3b3b3b&color=ffffff&size=256"
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10">Edit profile</button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-extrabold">Aniket Gupta</div>
          </div>
          <div className="text-neutral-400">@funnyket_</div>
          <div className="flex items-center gap-6 text-neutral-400 text-sm mt-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75V21a.75.75 0 00.75.75h13.5A.75.75 0 0019.5 21V9.75" />
              </svg>
              <span>Joined May 2025</span>
            </div>
            <div className="flex gap-4">
              <div>
                <span className="text-white font-semibold">18</span>
                <span className="text-neutral-400 ml-1">Following</span>
              </div>
              <div>
                <span className="text-white font-semibold">1</span>
                <span className="text-neutral-400 ml-1">Follower</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 border-b border-white/10">
          <div className="flex gap-6 overflow-x-auto">
            <button className="px-3 py-4 border-b-4 border-sky-500 text-white font-semibold">Posts</button>
            <button className="px-3 py-4 text-neutral-400 hover:text-white">Replies</button>
            <button className="px-3 py-4 text-neutral-400 hover:text-white">Highlights</button>
            <button className="px-3 py-4 text-neutral-400 hover:text-white">Articles</button>
            <button className="px-3 py-4 text-neutral-400 hover:text-white">Media</button>
          </div>
        </div>

        <div className="h-24"></div>
      </div>
    </div>
  );
}
