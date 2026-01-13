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
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="px-4 py-4 md:px-12 md:py-8">
          {/* Title with accent line */}
          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
            <div className="w-1 h-6 md:h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded"></div>
            <h1 className="text-xl md:text-4xl font-bold">Live Matches</h1>
          </div>
          <p className="text-xs md:text-sm text-gray-400 ml-3 md:ml-4 mb-4 md:mb-5">
            Follow live scores and join real-time discussions
          </p>

          {/* Category Tabs */}
          <div className="overflow-x-auto scrollbar-hide -mx-4 md:-mx-12 px-4 md:px-12">
            <div className="flex gap-1.5 md:gap-2 min-w-max pb-1">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/livematches/${cat.toLowerCase()}`}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${selectedCategory === cat.toLowerCase()
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent shadow-lg shadow-blue-500/30"
                    : "bg-gray-900/60 text-gray-300 border-gray-700 hover:bg-gray-800 hover:border-gray-600"
                    }`}
                >
                  {cat.replace("_", " ")}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Matches Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto w-full px-4 md:px-12 py-4 md:py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 text-gray-400">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-700 border-t-blue-500 animate-spin mb-4"></div>
              <p className="text-xs md:text-sm font-medium">Loading {selectedCategory} matches...</p>
            </div>
          ) : MatchesDiv ? (
            <div className="space-y-4 md:space-y-7">
              {MatchesDiv}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="inline-block mb-4 p-4 bg-gray-900/50 rounded-full border border-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m0 0L2.25 20.25M21.75 20.25l-8.228-4.431m0 0l-5.895-3.18m12.123 3.18l5.895-3.18m-12.123 0l8.228-4.431" />
                </svg>
              </div>
              <p className="text-gray-300 font-medium text-lg">No matches available</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for upcoming {selectedCategory} matches</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
