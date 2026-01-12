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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black border border-gray-600 rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-gray-900 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              disabled={saving}
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">{name.length}/50</p>
          </div>

          {/* Bio Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              maxLength={160}
              disabled={saving}
              rows={4}
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/160</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-600/20 border border-red-600 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 rounded-full border border-gray-600 text-white font-semibold hover:bg-gray-900/50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
