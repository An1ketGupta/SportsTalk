'use client'

import { useState, useEffect, JSX } from "react";
import HocketMatchesHandler from "../../api/handlers/sports/hockey";
import MMAMatchesHandler from "../../api/handlers/sports/mma";
import F1MatchesHandler from "../../api/handlers/sports/f1";
import BasketballMatchesHandler from "../../api/handlers/sports/basketball";
import TennisMatchesHandler from "../../api/handlers/sports/tennis";
import NBAMatchesHandler from "../../api/handlers/sports/nba";
import FootballMatchesHandler from "../../api/handlers/sports/football";
import CricketMatchHandler from "../../api/handlers/sports/cricket";
import { NFLMatchesHandler } from "../../api/handlers/sports/nfl";
import Link from "next/link";

// Sport icons mapping
const sportIcons: { [key: string]: string } = {
  nfl: "🏈",
  cricket: "🏏",
  football: "⚽",
  nba: "🏀",
  tennis: "🎾",
  basketball: "🏀",
  formula_1: "🏎️",
  mma: "🥊",
  hockey: "🏒"
};

export default function LiveMatches({ params }: any) {
  const categories = ["NFL", "Cricket", "Football", "NBA", "Tennis", "Basketball", "Formula_1", "MMA", "Hockey"];
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [MatchesDiv, setMatchesDiv] = useState<JSX.Element | null>(null);

  useEffect(() => {
    async function GetSportsCategory() {
      const category: string[] = (await params).sportscategory
      setSelectedCategory(category[0])
    }
    GetSportsCategory()
  }, [])

  useEffect(() => {
    async function MatchesHandler() {
      setLoading(true);
      if (selectedCategory) {
        let response: JSX.Element = <></>;
        if (selectedCategory === "nfl") {
          try {
            response = await NFLMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (selectedCategory === "cricket") {
          try {
            response = await CricketMatchHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (selectedCategory === "football") {
          try {
            response = await FootballMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (selectedCategory === "nba") {
          try {
            response = await NBAMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (selectedCategory === "tennis") {
          try {
            response = await TennisMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (selectedCategory === "basketball") {
          try {
            response = await BasketballMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (selectedCategory === "formula_1") {
          try {
            response = await F1MatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (selectedCategory === "mma") {
          try {
            response = await MMAMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        else if (selectedCategory === "hockey") {
          try {
            response = await HocketMatchesHandler();
          } catch (err) {
            console.error("Error fetching matches:", err);
          }
        }
        setMatchesDiv(response);
        setLoading(false);
      }
    }

    MatchesHandler();
  }, [selectedCategory]);

  return (
    <div className="min-h-[90vh] w-full bg-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-md">
        <div className="px-4 py-4 md:px-12 md:py-6">
          {/* Title Section */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-8 md:h-10 bg-gradient-to-b from-[#f35730] to-red-600 rounded-full"></div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">Live Matches</h1>
              <p className="text-xs md:text-sm text-[#9ca3af] mt-0.5">
                Follow live scores and join real-time discussions
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-medium text-red-400">Live</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="overflow-x-auto scrollbar-hide -mx-4 md:-mx-12 px-4 md:px-12">
            <div className="flex gap-2 min-w-max pb-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.toLowerCase();
                const icon = sportIcons[cat.toLowerCase()] || "🏅";
                return (
                  <Link
                    key={cat}
                    href={`/livematches/${cat.toLowerCase()}`}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border ${isActive
                      ? "bg-[#f35730] text-white border-[#f35730] shadow-lg"
                      : "bg-[#0f0f0f] text-[#9ca3af] border-white/10 hover:bg-[#181818] hover:text-white hover:border-white/20"
                      }`}
                  >
                    <span className="text-base">{icon}</span>
                    {cat.replace("_", " ")}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Matches Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto w-full px-4 md:px-12 py-6 md:py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#181818] border-t-[#f35730] animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">{sportIcons[selectedCategory] || "🏅"}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-[#9ca3af] mt-6">
                Loading {selectedCategory.replace("_", " ")} matches...
              </p>
            </div>
          ) : MatchesDiv ? (
            <div className="space-y-4 md:space-y-6">
              {MatchesDiv}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-[#0f0f0f] rounded-2xl border border-white/10">
                <span className="text-4xl">{sportIcons[selectedCategory] || "🏅"}</span>
              </div>
              <p className="text-white font-semibold text-xl mb-2">No matches available</p>
              <p className="text-[#9ca3af] text-sm max-w-sm mx-auto">
                There are no {selectedCategory.replace("_", " ")} matches scheduled right now. Check back soon!
              </p>
              <Link
                href="/community"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[#181818] hover:bg-[#252525] border border-white/10 rounded-xl text-sm font-medium transition-colors"
              >
                Join Community Discussions
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
