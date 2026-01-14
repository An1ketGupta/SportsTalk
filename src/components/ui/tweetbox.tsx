"use client";
import { useState, useRef } from "react";
import { FiImage, FiSmile, FiVideo, FiX, FiHash, FiUpload } from "react-icons/fi";
import { GoCheckCircleFill } from "react-icons/go";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ToastProvider";

export default function TweetBox({ onPostCreated }: { onPostCreated?: (post?: any) => void }) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [customTag, setCustomTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [emojiselected, setEmojiSelected] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showTagInput, setShowTagInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New state for Drag & Drop and Mentions
  const [isDragging, setIsDragging] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const MAX_CHARS = 280;
  const MAX_TAGS = 5;
  const charCount = text.length;
  const charPercentage = (charCount / MAX_CHARS) * 100;

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setText(text + emojiData.emoji);
    setEmojiSelected(false);
  };

  const processFile = async (file: File) => {
    // Validate file type
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const validVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
    const isImage = validImageTypes.includes(file.type);
    const isVideo = validVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      showToast("Invalid file type. Only images and videos are allowed.", "error");
      return;
    }

    // Validate file size
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    const maxSize = isVideo ? maxVideoSize : maxImageSize;

    if (file.size > maxSize) {
      showToast(`File too large. Maximum size is ${isVideo ? "100MB" : "10MB"}.`, "error");
      return;
    }

    // Show local preview first
    const objectUrl = URL.createObjectURL(file);
    setMediaPreview(objectUrl);
    setMediaType(isVideo ? "video" : "image");

    // Upload to Cloudinary
    try {
      setIsUploading(true);
      setUploadProgress(10);

      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress (since fetch doesn't support progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      setMediaUrl(data.url);
      setUploadProgress(100);
      showToast("Media uploaded successfully!", "success");
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast(error.message || "Failed to upload media", "error");
      // Clear preview on error
      setMediaPreview("");
      setMediaType(null);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length > MAX_CHARS) return;

    setText(newText);
    setCursorPosition(e.target.selectionStart);

    // Detect Mention
    const lastAtPos = newText.lastIndexOf("@", e.target.selectionStart - 1);
    if (lastAtPos !== -1) {
      const query = newText.substring(lastAtPos + 1, e.target.selectionStart);
      // Check if query contains space (end of mention)
      if (!/\s/.test(query) && query.length > 0) {
        setMentionQuery(query);
        setShowSuggestions(true);
        // Fetch suggestions
        try {
          const res = await fetch(`/api/users/search?q=${query}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data.users);
          }
        } catch (err) {
          console.error("Failed to fetch suggestions", err);
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectUser = (username: string) => {
    const lastAtPos = text.lastIndexOf("@", cursorPosition - 1);
    if (lastAtPos !== -1) {
      const prefix = text.substring(0, lastAtPos);
      const suffix = text.substring(cursorPosition);
      const newText = `${prefix}@${username} ${suffix}`;
      setText(newText);
      setShowSuggestions(false);
      // Focus back on textarea (helper needed if losing focus)
    }
  };

  // ... (keeping existing handlers like handleRemoveMedia, handleAddTag, handlePost) ...

  const handleRemoveMedia = () => {
    if (mediaPreview && mediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaUrl("");
    setMediaPreview("");
    setMediaType(null);
  };

  const handleAddTag = () => {
    const trimmedTag = customTag.trim().replace(/^#/, '');
    if (trimmedTag && tags.length < MAX_TAGS && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCustomTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handlePost = async () => {
    if (!text.trim() || isPosting || isUploading) return;

    try {
      setIsPosting(true);
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text.trim(),
          mediaUrl: mediaUrl.trim() || null,
          sport: tags.length > 0 ? tags.join(',') : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to post");
      }

      const data = await response.json();

      // Reset form
      setText("");
      handleRemoveMedia();
      setTags([]);
      setCustomTag("");

      // Notify parent with the new post
      if (onPostCreated) {
        onPostCreated(data.post);
      }

      showToast(data.message || "Post created successfully!", "success");
    } catch (error: any) {
      console.error("Post error:", error);
      showToast(error.message || "Failed to create post. Please try again.", "error");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div
      className={`text-white w-full rounded-2xl p-3 space-y-2 backdrop-blur-lg border transition-colors ${isDragging ? "bg-blue-500/20 border-blue-500" : "bg-black/10 border-gray-800"
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top section */}
      <div className="flex items-start space-x-3 relative">
        {/* Avatar */}
        <img
          className="w-10 h-10 rounded-full object-cover bg-gray-700"
          src={session?.user?.image ?? "/default-avatar.png"}
          alt={session?.user?.name ?? "User"}
        />

        {/* Input area */}
        <div className="flex-1 space-y-2 relative">
          <textarea
            value={text}
            onChange={handleTextChange}
            onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
            placeholder={isDragging ? "Drop media here..." : "What's happening in sports?"}
            className="w-full bg-transparent resize-none outline-none text-lg placeholder-gray-400"
            rows={3}
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 bg-black border border-gray-800 rounded-xl w-64 shadow-xl z-50 max-h-60 overflow-y-auto">
              {suggestions.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.username)}
                  className="flex items-center gap-3 w-full p-3 hover:bg-gray-900 text-left transition-colors"
                >
                  <img src={user.image ?? "/default-avatar.png"} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-sm">{user.name}</p>
                      {user.isVerified && <GoCheckCircleFill className="text-blue-500 w-3 h-3" />}
                    </div>
                    <p className="text-gray-500 text-xs">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

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
              {mediaType === "video" ? (
                <video
                  src={mediaPreview}
                  controls
                  className="w-full max-h-64 object-cover"
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover"
                />
              )}

              {/* Upload Progress Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 relative">
                    <svg className="transform -rotate-90 w-16 h-16">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#2f3336"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#1d9bf0"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - uploadProgress / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                      {uploadProgress}%
                    </span>
                  </div>
                  <p className="text-sm mt-2">Uploading...</p>
                </div>
              )}

              {/* Remove Button */}
              {!isUploading && (
                <button
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 bg-black/70 rounded-full p-2 hover:bg-black/90 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Tags Display */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-blue-500/30 rounded-full p-0.5"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tag Input */}
      {showTagInput && (
        <div className="pl-14">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">#</span>
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag (e.g., Football, NBA, WorldCup)"
                className="w-full bg-gray-900 rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={30}
              />
            </div>
            <button
              onClick={handleAddTag}
              disabled={!customTag.trim() || tags.length >= MAX_TAGS}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {tags.length}/{MAX_TAGS} tags added. Press Enter to add.
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Bottom actions */}
      <div className="flex justify-between items-center pl-12">
        <div className="flex items-center gap-2 text-blue-400">
          {/* Upload Media Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !!mediaPreview}
            className={`flex items-center gap-1 hover:bg-blue-500/10 px-3 py-1.5 rounded-full transition-colors ${(isUploading || mediaPreview) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            title="Upload image or video"
          >
            <FiImage className="w-5 h-5" />
            <FiVideo className="w-4 h-4 -ml-1" />
          </button>

          <button
            onClick={() => setEmojiSelected(!emojiselected)}
            className="hover:bg-blue-500/10 p-2 rounded-full transition-colors"
          >
            <FiSmile className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowTagInput(!showTagInput)}
            className={`flex items-center gap-1 text-sm hover:bg-blue-500/10 px-3 py-1.5 rounded-full transition-colors ${showTagInput ? 'bg-blue-500/20' : ''
              }`}
          >
            <FiHash className="w-4 h-4" />
            {tags.length > 0 ? `${tags.length} tag${tags.length > 1 ? 's' : ''}` : 'Add Tags'}
          </button>
        </div>

        {/* Post Button */}
        <button
          onClick={handlePost}
          disabled={!text.trim() || charCount > MAX_CHARS || isPosting || isUploading}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${text.trim() && charCount <= MAX_CHARS && !isPosting && !isUploading
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
        >
          {isPosting ? "Posting..." : isUploading ? "Uploading..." : "Post"}
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
