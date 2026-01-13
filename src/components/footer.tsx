"use client";
import { Mail, Bell, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black mb-20 border-t-[0.5px] border-gray-600 pt-12 sm:pt-20 text-gray-200 px-4 sm:px-6 lg:px-10 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 max-w-7xl mx-auto">
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-bold text-xl">SportsTalk</span>
          </div>
          <p className="text-gray-400">
            Connect with fellow sports enthusiasts, share your thoughts, and experience live matches together in our vibrant community.
          </p>

          <div className="flex flex-wrap gap-4 sm:gap-6 mt-6">
            <div className="bg-black/40 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-center">
              <p className="text-xl sm:text-2xl font-bold">10K+</p>
              <p className="text-xs sm:text-sm text-gray-400">Active Users</p>
            </div>
            <div className="bg-black/40 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-center">
              <p className="text-xl sm:text-2xl font-bold">24/7</p>
              <p className="text-xs sm:text-sm text-gray-400">Live Coverage</p>
            </div>
          </div>
        </div>

        {/* Platform */}
        <div>
          <h3 className="font-bold mb-3">Platform</h3>
          <ul className="space-y-2 text-gray-400">
            <li>Sports Categories</li>
            <li>Live Matches</li>
            <li>Community</li>
            <li>My Sports</li>
          </ul>
        </div>

        {/* Features */}
        <div>
          <h3 className="font-bold mb-3">Features</h3>
          <ul className="space-y-2 text-gray-400">
            <li>Live Chat</li>
            <li>Real-time Scores</li>
            <li>Community Posts</li>
            <li>Follow Sports</li>
          </ul>
        </div>

        {/* Support & Updates */}
        <div>
          <h3 className="font-bold mb-3">Support</h3>
          <ul className="space-y-2 text-gray-400 mb-6">
            <li>Help Center</li>
            <li>Contact Us</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
