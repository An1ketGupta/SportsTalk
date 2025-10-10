"use client";

import { useState } from "react";
import { FiImage, FiSmile, FiCalendar, FiMapPin } from "react-icons/fi";
import { MdOutlinePoll } from "react-icons/md";

export default function TweetBox() {
  const [text, setText] = useState("");

  return (
    <div className="text-white w-full rounded-2xl p-3 space-y-2 bg-black/10 backdrop-blur-lg">
      {/* Top section */}
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-700"></div>

        {/* Input area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What’s happening?"
          className="w-full bg-transparent resize-none outline-none text-lg placeholder-gray-400"
          rows={2}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Bottom actions */}
      <div className="flex justify-between items-center pl-12">
        <div className="flex space-x-4 text-blue-400">
          <FiImage className="cursor-pointer" />
          <MdOutlinePoll className="cursor-pointer" />
          <FiSmile className="cursor-pointer" />
          <FiCalendar className="cursor-pointer" />
          <FiMapPin className="cursor-pointer" />
        </div>

        {/* Post Button */}
        <button onClick={()=>{
          let tweetcontent = text;
          const username = cook

        }}
          disabled={!text.trim()}
          className={`px-4 py-1.5 rounded-full font-semibold ${
            text.trim()
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-600 text-gray-300 cursor-not-allowed"
          }`}
        >
          Post
        </button>
      </div>
    </div>
  );
}
