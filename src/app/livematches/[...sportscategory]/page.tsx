"use client";

import Footer from "@/components/footer";
import { useState, useEffect, JSX } from "react";
import category from "../../../public/sportsCategory";
import HocketMatchesHandler from "../../handlers/sports/hockey";
import MMAMatchesHandler from "../../handlers/sports/mma";
import F1MatchesHandler from "../../handlers/sports/f1";
import BasketballMatchesHandler from "../../handlers/sports/basketball";
import TennisMatchesHandler from "../../handlers/sports/tennis";
import NBAMatchesHandler from "../../handlers/sports/nba";
import FootballMatchesHandler from "../../handlers/sports/football";
import CricketMatchInfoHandler from "../../handlers/sports/cricket";
import { NFLMatchesHandler } from "../../handlers/sports/nfl";
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
              response = await CricketMatchInfoHandler();
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
              key={cat}
              href={`/livematches/${cat.toLowerCase()}`}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${
                  selectedCategory === cat.toLowerCase()
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
      {loading ? (
        <p>Loading {selectedCategory} games...</p>
      ) : MatchesDiv ? (
        <div>{MatchesDiv}</div>
      ) : (
        <p>No matches available.</p>
      )}

      <Footer />
    </div>
  );
}
