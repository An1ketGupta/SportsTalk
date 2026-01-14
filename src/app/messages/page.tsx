"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "../../components/sidebar";
import RightSection from "@/components/rightsection";
import { FiSend, FiSearch, FiEdit, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/ui/loader";
import { io, Socket } from "socket.io-client";

interface ConversationUser {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
}

interface Conversation {
  user: ConversationUser;
  lastMessage: {
    content: string;
    createdAt: string;
    isMine: boolean;
  } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isMine: boolean;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ConversationUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ConversationUser[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const myUserId = session?.user?.id as string | undefined;

  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("userId");

  const currentRoomRef = useRef<string | null>(null);

  useEffect(() => {
    if (!myUserId) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("receive-dm", (message: Message) => {
      console.log("Received DM:", message);
      // Always add received messages - socket.to() ensures we only receive others' messages
      // Force isMine to false since we're the receiver
      setMessages((prev) => [...prev, { ...message, isMine: false }]);
      loadConversations();
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [myUserId]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (userIdParam) {
      setSelectedUserId(userIdParam);
    }
  }, [userIdParam]);

  useEffect(() => {
    if (selectedUserId && myUserId && socketRef.current?.connected) {
      if (currentRoomRef.current) {
        console.log("Leaving room:", currentRoomRef.current);
        socketRef.current.emit("leave-dm", { roomId: currentRoomRef.current });
      }

      // Create consistent room ID
      const roomId = [myUserId, selectedUserId].sort().join("-");
      currentRoomRef.current = roomId;

      console.log("Joining DM room:", roomId);
      socketRef.current.emit("join-dm", { myUserId, otherUserId: selectedUserId });
      loadMessages(selectedUserId);
    }
  }, [selectedUserId, myUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await fetch("/api/messages/conversations");
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch (error) {
      console.error("Load conversations error:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`/api/messages/${userId}`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data.messages ?? []);
      setSelectedUser(data.user);
    } catch (error) {
      console.error("Load messages error:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      createdAt: new Date().toISOString(),
      isMine: true,
      sender: {
        id: session?.user?.id ?? "",
        name: session?.user?.name ?? null,
        image: session?.user?.image ?? null,
      },
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch(`/api/messages/${selectedUserId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? data.message : m))
      );

      // Emit message via socket for real-time delivery
      if (myUserId) {
        socketRef.current?.emit("send-dm", {
          myUserId,
          otherUserId: selectedUserId,
          message: data.message,
        });
      }

      // Update conversation list
      loadConversations();
    } catch (error) {
      console.error("Send message error:", error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/explore/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setSearchResults(
        (data.users ?? []).map((u: any) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          image: u.image,
        }))
      );
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const startNewConversation = (user: ConversationUser) => {
    setSelectedUserId(user.id);
    setSelectedUser(user);
    setShowNewChat(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (!session) {
    return (
      <div className="w-full h-[calc(100dvh-3.5rem)] sm:h-[90vh] flex pb-16 md:pb-0">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-xl font-semibold mb-2">Sign in to view messages</p>
            <p className="text-sm">Connect with other sports fans</p>
          </div>
        </div>
        <div className="hidden xl:block">
          <RightSection />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100dvh-3.5rem)] sm:h-[90vh] flex pb-16 md:pb-0">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex border-r border-white border-opacity-20">
        {/* Conversations List */}
        <div className={`w-full md:w-80 border-r border-gray-800 flex flex-col ${selectedUserId ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-gray-800 flex items-center justify-between shrink-0">
            <h1 className="text-xl font-bold">Messages</h1>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              title="New message"
            >
              <FiEdit className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Search */}
          {showNewChat && (
            <div className="p-3 border-b border-gray-800">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search for people..."
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto scrollbar-hide">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => startNewConversation(user)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <img
                        src={user.image ?? "/default-avatar.png"}
                        alt={user.name ?? user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="text-left">
                        <p className="font-semibold text-white">{user.name ?? user.username}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {loadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 px-4 text-gray-500">
                <p className="font-semibold">No messages yet</p>
                <p className="text-sm mt-1">Start a conversation with other fans</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.user.id}
                  onClick={() => setSelectedUserId(conv.user.id)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-900 transition-colors border-b border-gray-800/50 ${selectedUserId === conv.user.id ? "bg-gray-900" : ""
                    }`}
                >
                  <img
                    src={conv.user.image ?? "/default-avatar.png"}
                    alt={conv.user.name ?? conv.user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate">
                        {conv.user.name ?? conv.user.username}
                      </span>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage
                        ? `${conv.lastMessage.isMine ? "You: " : ""}${conv.lastMessage.content}`
                        : "No messages yet"}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedUserId ? "hidden md:flex" : "flex"}`}>
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              {selectedUser ? (
                <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="md:hidden p-2 hover:bg-gray-800 rounded-full"
                  >
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                  <Link href={`/user/${selectedUser.id}`} className="flex items-center gap-3">
                    <img
                      src={selectedUser.image ?? "/default-avatar.png"}
                      alt={selectedUser.name ?? selectedUser.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{selectedUser.name ?? selectedUser.username}</p>
                      <p className="text-sm text-gray-500 truncate">@{selectedUser.username}</p>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="p-4 border-b border-gray-800 flex items-center gap-3 h-[73px]">
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-8 h-full">
                    <Loader />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No messages yet</p>
                    <p className="text-sm mt-1">Say hello! 👋</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.isMine
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-white"
                          }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.isMine ? "text-blue-200" : "text-gray-500"}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Start a new message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-full py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-xl font-semibold mb-2">Select a message</p>
                <p className="text-sm">Choose from your existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden xl:block">
        <RightSection />
      </div>
    </div>
  );
}
