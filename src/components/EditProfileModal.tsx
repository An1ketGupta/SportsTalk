import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "./ui/card";
import { Input } from "./ui/input";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <Button
            onClick={onClose}
            disabled={saving}
            variant="ghost"
            size="icon"
            aria-label="Close edit profile"
          >
            <X size={18} />
          </Button>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="profile" className="h-16 w-16 object-cover" />
              ) : (
                <div className="text-gray-400">{user.username?.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{user.username}</div>
              <div className="text-xs text-muted-foreground">Public profile</div>
            </div>
            <div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={50}
                disabled={saving}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">{name.length}/50</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                maxLength={160}
                disabled={saving}
                rows={4}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground mt-1">{bio.length}/160</p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="gap-3">
          <div className="flex-1">
            <Button onClick={onClose} disabled={saving} variant="outline" className="w-full">Cancel</Button>
          </div>
          <div className="flex-1">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
