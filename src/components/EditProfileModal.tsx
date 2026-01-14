"use client";
import React, { useState, useRef } from "react";
import { X, Camera, Upload } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string | null;
    username: string;
    bio: string | null;
    image: string | null;
    coverImage?: string | null;
  };
  onSave: (data: {
    name: string;
    bio: string;
    image?: string;
    coverImage?: string;
  }) => Promise<void>;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [profileImage, setProfileImage] = useState(user.image ?? "");
  const [coverImage, setCoverImage] = useState(user.coverImage ?? "");
  const [profilePreview, setProfilePreview] = useState(user.image ?? "");
  const [coverPreview, setCoverPreview] = useState(user.coverImage ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"profile" | "cover" | null>(null);
  const [error, setError] = useState("");

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = async (file: File, type: "profile" | "cover") => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large. Maximum size is 5MB.");
      return;
    }

    // Show local preview
    const objectUrl = URL.createObjectURL(file);
    if (type === "profile") {
      setProfilePreview(objectUrl);
    } else {
      setCoverPreview(objectUrl);
    }

    try {
      setUploading(type);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();

      if (type === "profile") {
        setProfileImage(data.url);
      } else {
        setCoverImage(data.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      // Restore previous preview
      if (type === "profile") {
        setProfilePreview(user.image ?? "");
      } else {
        setCoverPreview(user.coverImage ?? "");
      }
      URL.revokeObjectURL(objectUrl);
    } finally {
      setUploading(null);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, "profile");
    if (profileInputRef.current) profileInputRef.current.value = "";
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, "cover");
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (uploading) {
      setError("Please wait for image upload to complete");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({
        name: name.trim(),
        bio: bio.trim(),
        image: profileImage || undefined,
        coverImage: coverImage || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 sticky top-0 bg-[#111] z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              disabled={saving || !!uploading}
              className="p-2 rounded-full hover:bg-white/5 transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} className="text-gray-400" />
            </button>
            <h2 className="text-white font-semibold">Edit profile</h2>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !!uploading}
            className="px-4 py-1.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5">
          {/* Cover Image */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
              {coverPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              {uploading === "cover" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={!!uploading}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors disabled:opacity-50"
              aria-label="Upload cover image"
            >
              <Camera size={20} className="text-white" />
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleCoverChange}
              className="hidden"
            />
          </div>

          {/* Profile Picture with Upload */}
          <div className="px-4 -mt-12 relative z-10">
            <div className="relative inline-block">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-black border-4 border-[#111] flex items-center justify-center">
                {profilePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePreview} alt="profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-3xl text-gray-500">{user.username?.charAt(0).toUpperCase()}</div>
                )}
                {uploading === "profile" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                    <div className="w-6 h-6 border-3 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button
                onClick={() => profileInputRef.current?.click()}
                disabled={!!uploading}
                className="absolute bottom-0 right-0 p-2 bg-black/70 hover:bg-black/90 rounded-full border-2 border-[#111] transition-colors disabled:opacity-50"
                aria-label="Upload profile picture"
              >
                <Camera size={14} className="text-white" />
              </button>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleProfileChange}
                className="hidden"
              />
            </div>
            <div className="mt-2">
              <div className="text-gray-500 text-sm">@{user.username}</div>
            </div>
          </div>

          <div className="p-4 pt-0 space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={50}
                disabled={saving || !!uploading}
                className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-white/20 disabled:opacity-50 transition-colors"
              />
              <p className="text-gray-600 text-xs mt-1.5 text-right">{name.length}/50</p>
            </div>

            {/* Bio Field */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                maxLength={160}
                disabled={saving || !!uploading}
                rows={3}
                className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-white/20 disabled:opacity-50 transition-colors resize-none"
              />
              <p className="text-gray-600 text-xs mt-1.5 text-right">{bio.length}/160</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
