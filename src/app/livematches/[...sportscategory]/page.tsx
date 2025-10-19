"use client";

import Footer from "@/components/footer";
import { useState, useEffect, JSX } from "react";
import category from "../../../public/sportsCategory";
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

export default function LiveMatches({params} : any) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [MatchesDiv, setMatchesDiv] = useState<JSX.Element | null>(null);

  useEffect(()=>{
    async function GetSportsCategory(){
      const category:string[] = (await params).sportscategory
      setSelectedCategory(category[0])
    }
    GetSportsCategory()
  },[])
  
  useEffect(() => {
    async function MatchesHandler() {
      setLoading(true);
      if(selectedCategory){
        let response:JSX.Element = <></>;
        if(selectedCategory === "nfl"){
          try{
              response = await NFLMatchesHandler();
            } catch (err) {
              console.error("Error fetching matches:", err);
            }
        }
        else if(selectedCategory === "cricket"){
          try {
              response = await CricketMatchHandler();
            } catch (err) {
              console.error("Error fetching matches:", err);
            }
        }
        else if(selectedCategory === "football"){
          try {
              response = await FootballMatchesHandler();
            } catch (err) {
              console.error("Error fetching matches:", err);
            }
        }
        else if(selectedCategory === "nba"){
          try {
              response = await NBAMatchesHandler();
            } catch (err) {
              console.error("Error fetching matches:", err);
            }
        }
        else if(selectedCategory === "tennis"){
          try {
              response = await TennisMatchesHandler();
            } catch (err) {
              console.error("Error fetching matches:", err);
            }
        }
        else if(selectedCategory === "basketball"){
          try {
              response = await BasketballMatchesHandler();
            } catch (err) {
              console.error("Error fetching matches:", err);
            }
        }
        else if(selectedCategory === "formula_1"){
          try {
              response = await F1MatchesHandler();
            } catch (err) {
              console.error("Error fetching matches:", err);
            }
        }
        else if(selectedCategory === "mma"){
          try {
              response = await MMAMatchesHandler();
            } catch (err) {
              console.error("Error fetching matches:", err);
            }
        }
        else if(selectedCategory === "hockey"){
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
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0b0b0b] to-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur supports-[backdrop-filter]:bg-black/40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-extrabold italic tracking-tight">Live Matches</h1>
          <p className="text-sm text-gray-300 mt-1 max-w-xl">
            Follow live scores and join real-time discussions with fans worldwide.
          </p>

          {/* Categories */}
          <div className="mt-5 -mx-6 px-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 min-w-max">
              {category.map((cat) => (
                <Link
                  key={cat}
                  href={`/livematches/${cat.toLowerCase()}`}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                    ${
                      selectedCategory === cat.toLowerCase()
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border-transparent"
                        : "bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white border-white/10"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70`}
                >
                  {cat.replace("_", " ")}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Matches */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto w-full px-6 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <div className="h-6 w-6 rounded-full border-2 border-gray-500 border-t-transparent animate-spin mb-3" />
              <p className="text-sm">Loading {selectedCategory} games...</p>
            </div>
          ) : MatchesDiv ? (
            <div className="space-y-6">
              {MatchesDiv}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-gray-400">No matches available.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
