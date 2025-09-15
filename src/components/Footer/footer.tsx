"use client";
import { Mail, Bell, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-200 px-10 py-12">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 max-w-7xl mx-auto">

        {/* Left Section */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏆</span>
            <span className="font-bold text-xl">SportsTalk</span>
          </div>
          <p className="text-gray-400">
            Connect with fellow sports enthusiasts, share your thoughts, and experience live matches together in our vibrant community.
          </p>

          <div className="flex gap-6 mt-6">
            <div className="bg-black/40 rounded-2xl px-6 py-4 text-center">
              <p className="text-2xl font-bold">10K+</p>
              <p className="text-sm text-gray-400">Active Users</p>
            </div>
            <div className="bg-black/40 rounded-2xl px-6 py-4 text-center">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-gray-400">Live Coverage</p>
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

          <div className="bg-black/40 rounded-2xl p-4">
            <h3 className="font-bold mb-2">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-3">
              Get the latest sports news and match updates delivered to your inbox.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Weekly newsletter
              </li>
              <li className="flex items-center gap-2">
                <Bell className="w-4 h-4" /> Match alerts
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4" /> Community highlights
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
        <p>© 2025 SportsTalk. Bringing sports fans together through shared passion.</p>
        <p className="flex items-center gap-4 mt-3 md:mt-0">
          <span className="flex items-center gap-1 text-green-400">
            ● Live
          </span>
          <span>Community Active</span>
        </p>
      </div>
    </footer>
  );
}
