"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "../../components/sidebar";
import RightSection from "@/components/rightsection";
import Link from "next/link";
import { FiHeart, FiMessageCircle, FiUserPlus, FiCheckCircle } from "react-icons/fi";
import { GoCheckCircleFill } from "react-icons/go";

interface NotificationActor {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  isVerified: boolean;
}

interface Notification {
  id: string;
  type: "like" | "comment" | "follow";
  read: boolean;
  createdAt: string;
  postId: string | null;
  actor: NotificationActor;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "mentions">("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch (error) {
      console.error("Load notifications error:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <FiHeart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <FiMessageCircle className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <FiUserPlus className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor.name ?? notification.actor.username;
    switch (notification.type) {
      case "like":
        return (
          <>
            <span className="font-semibold">{actorName}</span>
            {notification.actor.isVerified && <GoCheckCircleFill className="inline text-blue-500 ml-1" />}
            {" "}liked your post
          </>
        );
      case "comment":
        return (
          <>
            <span className="font-semibold">{actorName}</span>
            {notification.actor.isVerified && <GoCheckCircleFill className="inline text-blue-500 ml-1" />}
            {" "}commented on your post
          </>
        );
      case "follow":
        return (
          <>
            <span className="font-semibold">{actorName}</span>
            {notification.actor.isVerified && <GoCheckCircleFill className="inline text-blue-500 ml-1" />}
            {" "}started following you
          </>
        );
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!session) {
    return (
      <div className="w-full h-[90vh] flex pb-16 md:pb-0">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center border-r border-white border-opacity-20">
          <div className="text-center text-gray-400">
            <p className="text-xl font-semibold mb-2">Sign in to see notifications</p>
            <p className="text-sm">Stay updated with activity on your posts</p>
          </div>
        </div>
        <RightSection />
      </div>
    );
  }

  return (
    <div className="w-full h-[90vh] flex pb-16 md:pb-0">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 border-r border-white border-opacity-20 overflow-y-auto scrollbar-hide w-full md:max-w-xl lg:max-w-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10">
          <div className="p-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-400"
              >
                <FiCheckCircle className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-3 text-center font-semibold transition-colors ${activeTab === "all"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-500 hover:bg-gray-900"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("mentions")}
              className={`flex-1 py-3 text-center font-semibold transition-colors ${activeTab === "mentions"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-500 hover:bg-gray-900"
                }`}
            >
              Mentions
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 px-4 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <FiHeart className="w-8 h-8" />
              </div>
              <p className="font-semibold text-lg">No notifications yet</p>
              <p className="text-sm mt-1">
                When someone interacts with your posts, you&apos;ll see it here
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`flex items-start gap-3 p-4 border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors cursor-pointer ${!notification.read ? "bg-blue-500/5" : ""
                  }`}
              >
                {/* Icon */}
                <div className="p-2 bg-gray-800 rounded-full">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <Link href={`/user/${notification.actor.id}`}>
                      <img
                        src={notification.actor.image ?? "/default-avatar.png"}
                        alt={notification.actor.name ?? notification.actor.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </Link>
                    <div className="flex-1">
                      <p className="text-white">
                        {getNotificationText(notification)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Link to post if applicable */}
                  {notification.postId && notification.type !== "follow" && (
                    <Link
                      href={`/post/${notification.postId}`}
                      className="text-sm text-gray-500 hover:text-gray-400 mt-2 block"
                    >
                      View post →
                    </Link>
                  )}
                </div>

                {/* Read indicator */}
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="hidden xl:block">
        <RightSection />
      </div>
    </div>
  );
}
