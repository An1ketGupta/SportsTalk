"use client";

import Footer from "@/components/footer";
import { useState } from "react";
import tennisMatchesHandler from "../../handlers/sports/tennis";
import Link from "next/link";
import category from "@/public/sportsCategory";

export default function LiveMatches() {
  const [matchesdata , setMatchesData] = useState()

  async function HandlerCaller(){
    const response = await tennisMatchesHandler();
    
  }

  return (
    <div className="w-full h-screen bg-[#0f0f0f] text-white">
      {/* Main Content full width */}
      <div className="w-full border-none overflow-y-auto scrollbar-hide px-4 sm:px-6">
        <div className="sticky top-0 bg-black/20 backdrop-blur-md border-none py-6">
          <h1 className="text-3xl font-extrabold italic">Live Matches</h1>
          <p className="text-sm text-[#cfd2cc] mt-1 max-w-2xl">
            Follow live scores and join real-time discussions with fellow sports fans
          </p>

          {/* Categories */}
          <div className="mt-4 bg-[#181818] px-4 py-3 rounded-xl flex flex-wrap gap-3 overflow-x-auto">
            {category.map((cat) => (
              <Link
                href={`./${cat.toLowerCase()}`}
                key={cat}
                onClick={() => {
                }}
                className={`px-4 py-1 rounded-full bg-gray-800"`}>
                {cat}
              </Link>
            ))}
          </div>

          {/* Matches grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 pb-20">
            This is where the matches will appear
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
