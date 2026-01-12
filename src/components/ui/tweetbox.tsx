"use client";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useState, useRef } from "react";
import { FiImage, FiSmile, FiX } from "react-icons/fi";
import { useSession } from "next-auth/react";

const SPORTS_CATEGORIES = [
  "Football",
  "Basketball",
  "Tennis",
  "Cricket",
  "Baseball",
  "Hockey",
  "Soccer",
  "Golf",
  "Rugby",
  "Other",
];

export default function TweetBox({ onPostCreated }: { onPostCreated?: () => void }) {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [emojiselected, setEmojiSelected] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showSportDropdown, setShowSportDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 280;
  const charCount = text.length;
  const charPercentage = (charCount / MAX_CHARS) * 100;

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setText(text + emojiData.emoji);
    setEmojiSelected(false);
  };

  const handleMediaUrlChange = (url: string) => {
    setMediaUrl(url);
    if (url.trim()) {
      setMediaPreview(url);
    } else {
      setMediaPreview("");
    }
  };

  const handlePost = async () => {
    if (!text.trim() || isPosting) return;

    try {
      setIsPosting(true);
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text.trim(),
          mediaUrl: mediaUrl.trim() || null,
          sport: selectedSport || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to post");
      }

      const data = await response.json();
      
      // Reset form
      setText("");
      setMediaUrl("");
      setMediaPreview("");
      setSelectedSport("");
      
      // Notify parent
      if (onPostCreated) {
        onPostCreated();
      }
      
      alert(data.message || "Post created successfully!");
    } catch (error: any) {
      console.error("Post error:", error);
      alert(error.message || "Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="text-white w-full rounded-2xl p-3 space-y-2 bg-black/10 backdrop-blur-lg border border-gray-800">
      {/* Top section */}
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <img
          className="w-10 h-10 rounded-full object-cover bg-gray-700"
          src={session?.user?.image ?? "/default-avatar.png"}
          alt={session?.user?.name ?? "User"}
        />

        {/* Input area */}
        <div className="flex-1 space-y-2">
          <textarea
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setText(e.target.value);
              }
            }}
            placeholder="What's happening in sports?"
            className="w-full bg-transparent resize-none outline-none text-lg placeholder-gray-400"
            rows={3}
          />

          {/* Character Counter */}
          {charCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <svg className="transform -rotate-90 w-8 h-8">
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke="#2f3336"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke={charPercentage >= 100 ? "#ef4444" : charPercentage >= 90 ? "#eab308" : "#1d9bf0"}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 12}`}
                    strokeDashoffset={`${2 * Math.PI * 12 * (1 - charPercentage / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                {charPercentage >= 90 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                    {MAX_CHARS - charCount}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Media Preview */}
          {mediaPreview && (
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={mediaPreview}
                alt="Preview"
                className="w-full max-h-64 object-cover"
              />
              <button
                onClick={() => {
                  setMediaUrl("");
                  setMediaPreview("");
                }}
                className="absolute top-2 right-2 bg-black/70 rounded-full p-2 hover:bg-black/90 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sport Tag */}
          {selectedSport && (
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
              <span>#{selectedSport}</span>
              <button
                onClick={() => setSelectedSport("")}
                className="hover:bg-blue-500/30 rounded-full"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media URL Input */}
      {!mediaPreview && (
        <div className="pl-14">
          <input
            type="text"
            value={mediaUrl}
            onChange={(e) => handleMediaUrlChange(e.target.value)}
            placeholder="Paste image URL (optional)"
            className="w-full bg-gray-900 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Bottom actions */}
      <div className="flex justify-between items-center pl-12">
        <div className="flex items-center gap-4 text-blue-400">
          <button
            onClick={() => setEmojiSelected(!emojiselected)}
            className="hover:bg-blue-500/10 p-2 rounded-full transition-colors"
          >
            <FiSmile className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSportDropdown(!showSportDropdown)}
              className="text-sm hover:bg-blue-500/10 px-3 py-1.5 rounded-full transition-colors"
            >
              {selectedSport || "Add Sport Tag"}
            </button>
            {showSportDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-gray-900 rounded-lg border border-gray-700 shadow-xl z-10 max-h-60 overflow-y-auto">
                {SPORTS_CATEGORIES.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => {
                      setSelectedSport(sport);
                      setShowSportDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors text-sm"
                  >
                    {sport}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Post Button */}
        <button
          onClick={handlePost}
          disabled={!text.trim() || charCount > MAX_CHARS || isPosting}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${
            text.trim() && charCount <= MAX_CHARS && !isPosting
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-600 text-gray-300 cursor-not-allowed"
          }`}
        >
          {isPosting ? "Posting..." : "Post"}
        </button>
      </div>

      {/* Emoji Picker */}
      {emojiselected && (
        <div className="absolute z-50 mt-2">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
}
