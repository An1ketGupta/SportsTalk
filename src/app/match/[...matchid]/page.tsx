
import SquareBox from "@/components/squarebox";
import { Button } from "@/components/ui/button";

export default function Match() {
  return (
    <div className="w-full p-8 sm:py-[10vh] flex flex-col lg:flex-row gap-4 lg:gap-8 items-start justify-center bg-[#181818]">
      {/* Match Details Section */}
      <div className="w-full lg:w-2/3">
        <SquareBox height="auto" width="full" paddingy="4vh" paddingx="2vh sm:paddingx-6vh" bg="#23272f">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row w-full justify-between px-4 sm:px-10 gap-2 sm:gap-0">
            <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-red-500 to-orange-400 text-white font-semibold text-base sm:text-lg shadow">Live</span>
            <span className="inline-block px-4 py-1 rounded-full bg-[#23272f] border border-gray-600 text-gray-300 font-medium text-base sm:text-lg">19 Sep 2025</span>
          </div>

          {/* Title */}
          <div className="italic text-2xl sm:text-4xl py-6 sm:py-8 flex justify-center font-bold text-center text-white">
            Australia Vs India <span className="ml-4 flex items-center px-3 py-1 rounded-full bg-blue-700 text-white text-sm font-semibold">Cricket League</span>
          </div>

          {/* Teams & Score */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between px-4 sm:px-10 gap-6">
            {/* Team 1 */}
            <div className="flex flex-col gap-2 items-center w-full sm:w-auto">
              <img
                className="rounded-full w-20 h-20 sm:w-24 sm:h-24 object-cover border-4 border-blue-700 shadow-lg"
                src="https://static.wixstatic.com/media/514654_d160bb25e5ee482396f452581556f189~mv2.png/v1/fill/w_100,h_100,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/514654_d160bb25e5ee482396f452581556f189~mv2.png"
                alt="Team 1 Logo"
              />
              <div className="font-semibold text-lg sm:text-2xl text-white">Australia</div>
              <div className="font-bold text-xl sm:text-3xl text-green-400">120/4</div>
            </div>

            {/* VS text */}
            <div className="font-semibold text-xl sm:text-3xl text-gray-400 my-4 sm:my-0">VS</div>

            {/* Team 2 */}
            <div className="flex flex-col gap-2 items-center w-full sm:w-auto">
              <img
                className="rounded-full w-20 h-20 sm:w-24 sm:h-24 object-cover border-4 border-orange-500 shadow-lg"
                src="https://static.wixstatic.com/media/514654_d160bb25e5ee482396f452581556f189~mv2.png/v1/fill/w_100,h_100,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/514654_d160bb25e5ee482396f452581556f189~mv2.png"
                alt="Team 2 Logo"
              />
              <div className="font-semibold text-lg sm:text-2xl text-white">India</div>
              <div className="font-bold text-xl sm:text-3xl text-green-400">115/5</div>
            </div>
          </div>
        </SquareBox>
      </div>
      {/* Chat Bar Section */}
      <div className="w-full lg:w-1/3">
        <SquareBox height="auto" width="full" paddingy="4vh" paddingx="2vh" bg="#23272f">
          <div className="font-bold italic text-lg mb-4 text-white flex items-center gap-2">
            Live Chat
            <span className="px-2 py-1 rounded-full bg-green-500 text-white text-xs font-semibold">Active</span>
          </div>
          <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
            {/* Sample chat messages */}
            <div className="flex gap-2 items-start">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-blue-500" />
              <div>
                <div className="font-semibold text-sm text-white">Rahul</div>
                <div className="bg-[#181818] rounded-xl px-4 py-2 text-gray-200 text-xs shadow">What a six! Australia is on fire today.</div>
                <div className="text-[10px] text-gray-500 mt-1">19:05</div>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-orange-500" />
              <div>
                <div className="font-semibold text-sm text-white">Priya</div>
                <div className="bg-[#181818] rounded-xl px-4 py-2 text-gray-200 text-xs shadow">India needs to pick up the pace. Go India!</div>
                <div className="text-[10px] text-gray-500 mt-1">19:06</div>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-green-500" />
              <div>
                <div className="font-semibold text-sm text-white">Amit</div>
                <div className="bg-[#181818] rounded-xl px-4 py-2 text-gray-200 text-xs shadow">What a close match! Loving the energy in the chat.</div>
                <div className="text-[10px] text-gray-500 mt-1">19:07</div>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-pink-500" />
              <div>
                <div className="font-semibold text-sm text-white">Sneha</div>
                <div className="bg-[#181818] rounded-xl px-4 py-2 text-gray-200 text-xs shadow">Can someone share the current run rate?</div>
                <div className="text-[10px] text-gray-500 mt-1">19:08</div>
              </div>
            </div>
          </div>
          {/* Chat input */}
          <div className="mt-6 flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 rounded-full px-4 py-2 bg-[#181818] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
            <Button className="rounded-full px-4 py-2 bg-blue-700 text-white font-semibold hover:bg-blue-800">Send</Button>
          </div>
        </SquareBox>
      </div>
    </div>
  );
}
