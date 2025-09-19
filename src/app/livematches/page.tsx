"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import MatchCatalogue from "@/components/matchcatalogue";
import matchesData from "@/public/matchesdata.json";
import Footer from "@/components/footer";

const categories = [
  "All Sports",
  "Football",
  "Basketball",
  "Tennis",
  "Formula 1",
  "Cricket",
  "American Football",
  "Esports",
  "Athletics",
];

export default function LiveMatches() {
  const [active, setActive] = useState("All Sports");

  // Filter matches by category
  const filteredMatches = active === "All Sports"
    ? matchesData
    : matchesData.filter((m) => m.category === active);

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f] text-white">
      {/* Main Content full width */}
      <div className="w-full pt-[10vh] border-none overflow-y-auto scrollbar-hide px-4 sm:px-6">
        <div className="sticky top-0 bg-black/20 backdrop-blur-md border-none py-6">
          <h1 className="text-3xl font-extrabold italic">Live Matches</h1>
          <p className="text-sm text-[#cfd2cc] mt-1 max-w-2xl">Follow live scores and join real-time discussions with fellow sports fans</p>

          {/* Categories */}
          <div className="mt-4 bg-[#181818] px-4 py-3 rounded-xl flex flex-wrap gap-3 overflow-x-auto">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActive(cat)}
                className={cn(
                  "px-3 py-1 rounded-md border border-gray-600 text-sm font-medium transition-all whitespace-nowrap",
                  active === cat ? "bg-[#263448] text-white border-[#263448] shadow-md" : "bg-transparent text-gray-300 hover:bg-gray-800"
                )}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Matches grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 pb-20">
          {filteredMatches.map((m) => (
            <MatchCatalogue
              key={m.id}
              league={m.league}
              title={m.title}
              date={m.date}
              status={m.status}
              home={m.home}
              away={m.away}
              homeScore={m.homeScore}
              awayScore={m.awayScore}
            />
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
}
