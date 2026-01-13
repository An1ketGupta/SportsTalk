import { Button } from "@/components/ui/button";
import axios from "axios";
import { User, MapPin } from "lucide-react";

export default async function Profile() {
  return (
    <div className="flex flex-col">
      {/* Banner */}
      <div className="w-full">
        <img
          src="https://pbs.twimg.com/profile_banners/1437044443194871815/1754813282/1080x360"
          alt="Profile banner"
          className="w-full h-40 object-cover"
        />
      </div>

      {/* Profile picture & content */}
      <div className="px-4 sm:px-6">
        {/* Profile Picture */}
        <div className="-translate-y-12">
          <img
            className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full border-4 border-white"
            src="https://pbs.twimg.com/profile_banners/1437044443194871815/1754813282/1080x360"
            alt="Profile picture"
          />
        </div>

        {/* Header Section */}
        <div className="-translate-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Aditya</h1>
              <p className="text-gray-400">@modulus004</p>
            </div>
            <Button className="rounded-full px-3 sm:px-4 py-1 bg-white text-black text-sm font-semibold hover:bg-gray-100">
              Follow
            </Button>
          </div>

          {/* Bio */}
          <p className="mt-3 text-sm sm:text-base">
            Electrical engineer who codes ⚡
            <br />
            <span className="text-blue-400">@soulscriptdev</span> ·
            <span className="text-blue-400"> @goalcastdev</span>
          </p>

          {/* Info Section */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-400 text-sm">
            <div className="flex items-center gap-1">
              <User size={16} />
              <span>Software developer / Programmer / Software engineer</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>Mars</span>
            </div>
          </div>

          <p className="mt-1 text-gray-400 text-sm">Joined September 2021</p>

          {/* Followers Section */}
          <div className="flex gap-4 mt-3 text-sm">
            <span>
              <b>959</b> Following
            </span>
            <span>
              <b>961</b> Followers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
