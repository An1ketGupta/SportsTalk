import React, { useState } from "react";
import { X } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string | null;
    username: string;
    bio: string | null;
    image: string | null;
  };
  onSave: (data: {
    name: string;
    bio: string;
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({
        name: name.trim(),
        bio: bio.trim(),
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
      <div className="bg-[#111] border border-white/10 rounded-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              disabled={saving}
              className="p-2 rounded-full hover:bg-white/5 transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} className="text-gray-400" />
            </button>
            <h2 className="text-white font-semibold">Edit profile</h2>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="profile" className="h-16 w-16 object-cover" />
              ) : (
                <div className="text-2xl text-gray-500">{user.username?.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium">@{user.username}</div>
              <div className="text-gray-500 text-sm">Public profile</div>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              disabled={saving}
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
              disabled={saving}
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
  );
}
