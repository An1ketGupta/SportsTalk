'use client'

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import RightSection from "@/components/rightsection";
import Link from "next/link";
import { GoCheckCircleFill } from "react-icons/go";
import { FaHeart, FaRegHeart, FaShare, FaArrowLeft } from "react-icons/fa";
import { FiImage, FiX, FiSmile } from "react-icons/fi";
import { useToast } from "@/components/ToastProvider";
import Loader from "@/components/ui/loader";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

function formatTimeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [postId, setPostId] = useState("");

  // File upload states for reply
  const [replyMediaUrl, setReplyMediaUrl] = useState("");
  const [replyMediaPreview, setReplyMediaPreview] = useState("");
  const [replyMediaType, setReplyMediaType] = useState<"image" | "video" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function getParams() {
      const p = await params;
      setPostId(p.id);
    }
    getParams();
  }, [params]);

  useEffect(() => {
    if (postId) {
      loadPost();
      loadComments();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) throw new Error("Failed to load post");
      const data = await res.json();
      setPost(data.post);
      setIsLiked(data.post.isLiked);
      setLikeCount(data.post.likeCount);
      setCommentCount(data.post.commentCount);
    } catch (error) {
      console.error("Load post error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoadingComments(true);
      } else {
        setLoadingMore(true);
      }

      const res = await fetch(`/api/posts/${postId}/comments?page=${pageNum}&limit=10`);
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();

      if (pageNum === 1) {
        setComments(data.comments);
      } else {
        setComments((prev) => [...prev, ...data.comments]);
      }

      setHasMore(data.hasMore ?? false);
    } catch (error) {
      console.error("Load comments error:", error);
    } finally {
      setLoadingComments(false);
      setLoadingMore(false);
    }
  };

  const handleLike = async () => {
    try {
      const previousLiked = isLiked;
      const previousCount = likeCount;

      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (!res.ok) {
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
        throw new Error("Failed to toggle like");
      }

      const data = await res.json();
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText, mediaUrl: replyMediaUrl || null }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      const data = await res.json();
      setComments([data.comment, ...comments]);
      setCommentText("");
      setCommentCount(commentCount + 1);
      // Clear media after posting
      handleRemoveReplyMedia();
    } catch (error) {
      console.error("Comment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // File upload handlers for reply
  const handleReplyFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processReplyFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processReplyFile = async (file: File) => {
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const validVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
    const isImage = validImageTypes.includes(file.type);
    const isVideo = validVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      showToast("Invalid file type. Only images and videos are allowed.", "error");
      return;
    }

    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast(`File too large. Maximum size is ${isVideo ? "100MB" : "10MB"}.`, "error");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setReplyMediaPreview(objectUrl);
    setReplyMediaType(isVideo ? "video" : "image");

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      setReplyMediaUrl(data.url);
      showToast("Media uploaded successfully!", "success");
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast(error.message || "Failed to upload media", "error");
      setReplyMediaPreview("");
      setReplyMediaType(null);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveReplyMedia = () => {
    if (replyMediaPreview && replyMediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(replyMediaPreview);
    }
    setReplyMediaUrl("");
    setReplyMediaPreview("");
    setReplyMediaType(null);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: "Check out this post",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!", "success");
    }
  };

  const loadMoreComments = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadComments(nextPage);
  };

  if (loading) {
    return (
      <div className="w-full h-[90vh] flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="border-r max-w-[88vh] border-white border-opacity-20 overflow-y-auto scrollbar-hide flex-1 pb-16 md:pb-0">
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        </div>
        <RightSection />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full h-[90vh] flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="border-r max-w-[88vh] border-white border-opacity-20 overflow-y-auto scrollbar-hide flex-1 pb-16 md:pb-0">
          <div className="flex items-center justify-center py-20">
            <div className="text-center text-gray-400">
              <p className="text-xl font-semibold">Post not found</p>
            </div>
          </div>
        </div>
        <RightSection />
      </div>
    );
  }

  const createdAt = new Date(post.createdAt);

  return (
    <div className="w-full h-[90vh] flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="border-r max-w-[88vh] border-white border-opacity-20 overflow-y-auto scrollbar-hide flex-1 pb-16 md:pb-0">
        {/* Header */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-800">
          <div className="flex items-center gap-4 p-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Post</h1>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-3">
            <Link href={`/user/${post.author.id}`}>
              <img
                className="w-12 h-12 rounded-full object-cover"
                src={post.author.image ?? "/default-avatar.png"}
                alt={post.author.name ?? post.author.username}
              />
            </Link>
            <div className="flex-1">
              <Link href={`/user/${post.author.id}`} className="hover:underline">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{post.author.name ?? post.author.username}</span>
                  {post.author.isVerified && <GoCheckCircleFill className="text-blue-500 w-4 h-4" />}
                </div>
                <span className="text-gray-500 text-sm">@{post.author.username}</span>
              </Link>
            </div>
          </div>

          <div className="mt-3 text-[15px] leading-relaxed whitespace-pre-line">
            {post.content}
          </div>

          {post.mediaUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden w-full">
              {/\.(mp4|webm|ogg|mov)$/i.test(post.mediaUrl) ? (
                <video
                  src={post.mediaUrl}
                  controls
                  className="w-full max-h-[500px] object-cover"
                />
              ) : (
                <img
                  src={post.mediaUrl}
                  alt="Post media"
                  className="w-full max-h-[500px] object-cover"
                />
              )}
            </div>
          )}

          <div className="mt-3 text-gray-500 text-sm">
            {createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
            {createdAt.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4 py-3 border-y border-gray-800 text-sm">
            <div>
              <span className="font-semibold">{likeCount}</span>{" "}
              <span className="text-gray-500">Likes</span>
            </div>
            <div>
              <span className="font-semibold">{commentCount}</span>{" "}
              <span className="text-gray-500">Comments</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-around py-2 border-b border-gray-800">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isLiked ? "text-red-500 bg-red-500/10" : "hover:bg-gray-800"
                }`}
            >
              {isLiked ? <FaHeart className="w-5 h-5" /> : <FaRegHeart className="w-5 h-5" />}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <FaShare className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comment Input */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-800" />
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post your reply"
                rows={2}
                className="w-full bg-transparent outline-none resize-none text-[15px]"
              />

              {/* Media Preview */}
              {replyMediaPreview && (
                <div className="relative rounded-xl overflow-hidden mt-2 max-w-xs">
                  {replyMediaType === "video" ? (
                    <video src={replyMediaPreview} controls className="w-full max-h-40 object-cover" />
                  ) : (
                    <img src={replyMediaPreview} alt="Preview" className="w-full max-h-40 object-cover" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {!isUploading && (
                    <button
                      onClick={handleRemoveReplyMedia}
                      className="absolute top-1 right-1 bg-black/70 rounded-full p-1 hover:bg-black/90 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={handleReplyFileSelect}
                className="hidden"
              />

              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || !!replyMediaPreview}
                    className={`p-2 hover:bg-gray-800 rounded-full transition-colors text-blue-500 ${(isUploading || replyMediaPreview) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Add image or video"
                  >
                    <FiImage className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 hover:bg-gray-800 rounded-full transition-colors text-blue-500"
                      title="Add emoji"
                    >
                      <FiSmile className="w-5 h-5" />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-10 left-0 z-50">
                        <EmojiPicker
                          onEmojiClick={(emojiData: EmojiClickData) => {
                            setCommentText(prev => prev + emojiData.emoji);
                            setShowEmojiPicker(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim() || isSubmitting || isUploading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1.5 rounded-full font-semibold text-sm"
                >
                  {isSubmitting ? "Posting..." : isUploading ? "Uploading..." : "Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div>
          {loadingComments ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No comments yet</p>
              <p className="text-sm mt-1">Be the first to comment!</p>
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                  <div className="flex gap-3">
                    <Link href={`/user/${comment.author.id}`}>
                      <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={comment.author.image ?? "/default-avatar.png"}
                        alt={comment.author.name ?? comment.author.username}
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/user/${comment.author.id}`} className="hover:underline">
                          <span className="font-semibold text-sm">
                            {comment.author.name ?? comment.author.username}
                          </span>
                        </Link>
                        <span className="text-gray-500 text-sm">@{comment.author.username}</span>
                        <span className="text-gray-500 text-xs">
                          · {formatTimeAgo(new Date(comment.createdAt))}
                        </span>
                      </div>
                      <p className="text-[15px] mt-1 whitespace-pre-line">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="p-4 flex justify-center">
                  <button
                    onClick={loadMoreComments}
                    disabled={loadingMore}
                    className="text-blue-500 hover:text-blue-400 text-sm font-semibold disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Load more comments"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <RightSection />
    </div>
  );
}
