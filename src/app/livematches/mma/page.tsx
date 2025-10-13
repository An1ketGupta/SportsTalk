"use client";

import Footer from "@/components/footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import tennisMatchesHandler from "@/app/handlers/sports/tennis";
import category from "../../../public/sportsCategory"
import mmaMatchesHandler from "@/app/handlers/sports/mma";

export default function LiveMatches() {
  const [selectedCategory, setSelectedCategory] = useState("MMA");
  const [matchData, setMatchData] = useState<any[]>([]);

  useEffect(() => {
    async function HandlerCaller() {
      const response = await mmaMatchesHandler();
      setMatchData(Array.isArray(response) ? response : []);
    }
    HandlerCaller();
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-md px-6 py-6 border-b border-white/10">
        <h1 className="text-4xl font-extrabold italic tracking-tight">Live Matches</h1>
        <p className="text-sm text-[#cfd2cc] mt-1 max-w-xl">
          Follow live scores and join real-time discussions with fans worldwide.
        </p>

        {/* Categories */}
        <div className="mt-5 flex flex-wrap gap-3">
          {category.map((cat) => (
            <Link
              href={`./${cat.toLowerCase()}`}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
            >
              {cat.replace("_", " ")}
            </Link>
          ))}
        </div>
      </div>

      {/* Matches */}
      <div>
        This is where the matches will appear
      </div>

      <Footer />
    </div>
  );
}
