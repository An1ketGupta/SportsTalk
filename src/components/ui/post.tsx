"use client";
import Link from "next/link";
import { useState } from "react";
import SquareBox from "./squarebox";
import { GoCheckCircleFill } from "react-icons/go";
import { FaHeart, FaRegHeart, FaRegComment, FaRetweet, FaShare, FaTrash } from "react-icons/fa";

export type FeedPost = {
  id: string;
  content: string;
  createdAt: string | Date;
  mediaUrl?: string | null;
  sport?: string | null;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  recommendationReason?: string | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    username: string;
  };
};

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

export default function Post({ post, onDelete }: { post: FeedPost; onDelete?: () => void }) {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const createdAt =
    typeof post.createdAt === "string"
      ? new Date(post.createdAt)
      : post.createdAt;

  const handleLike = async () => {
    try {
      const previousLiked = isLiked;
      const previousCount = likeCount;
      
      // Optimistic update
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      });

      if (!res.ok) {
        // Revert on error
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

  const loadComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments);
      return;
    }

    try {
      setIsLoadingComments(true);
      const res = await fetch(`/api/posts/${post.id}/comments`);
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments(data.comments ?? []);
      setShowComments(true);
    } catch (error) {
      console.error("Load comments error:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      
      const data = await res.json();
      setComments([data.comment, ...comments]);
      setCommentCount(commentCount + 1);
      setCommentText("");
    } catch (error) {
      console.error("Comment error:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete post");
      
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.author.name || post.author.username}`,
        text: post.content,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <SquareBox
      bg="black"
      height="auto"
      width="full"
      paddingx="2.5vh"
      paddingy="3vh"
      rounded="0vh"
    >
      <div className="grid grid-cols-12 gap-3 w-full">
        <div className="col-span-1 flex justify-center">
          <Link href={`/user/${post.author.id}`} onClick={(e) => e.stopPropagation()}>
            <img
              className="w-11 h-11 rounded-full object-cover hover:opacity-80 transition-opacity"
              src={post.author.image ?? "/default-avatar.png"}
              alt={post.author.name ?? post.author.username}
            />
          </Link>
        </div>
        <div className="col-span-11 pl-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link href={`/user/${post.author.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 font-semibold hover:underline">
                <span>{post.author.name ?? post.author.username}</span>
                <GoCheckCircleFill className="text-blue-500" />
              </Link>
              <span className="text-[#4b4d51]">@{post.author.username}</span>
              <span className="text-[#4b4d51] text-xs">· {formatTimeAgo(createdAt)}</span>
            </div>
          </div>

          <Link href={`/post/${post.id}`} className="block">
            <div className="text-[15px] leading-relaxed whitespace-pre-line">
              {post.content}
            </div>
          </Link>

          {post.mediaUrl && (
            <Link href={`/post/${post.id}`}>
              <img
                className="rounded-3xl mt-2 w-full object-cover max-h-96 hover:opacity-95 transition-opacity cursor-pointer"
                src={post.mediaUrl}
                alt="Post media"
              />
            </Link>
          )}

          {/* Action Buttons */}
          <div className="flex gap-8 text-sm text-[#71767b] mt-3">
            <Link 
              href={`/post/${post.id}`} 
              onClick={(e) => e.stopPropagation()} 
              className="flex items-center gap-2 hover:text-blue-500 transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <FaRegComment className="w-4 h-4" />
              </div>
              <span>{commentCount}</span>
            </Link>

            <button
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              className={`flex items-center gap-2 transition-colors group ${
                isLiked ? "text-red-500" : "hover:text-red-500"
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                {isLiked ? (
                  <FaHeart className="w-4 h-4" />
                ) : (
                  <FaRegHeart className="w-4 h-4" />
                )}
              </div>
              <span>{likeCount}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="flex items-center gap-2 hover:text-green-500 transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <FaShare className="w-4 h-4" />
              </div>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 space-y-3 border-t border-gray-800 pt-3">
              {/* Comment Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-gray-900 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isSubmittingComment) {
                      handleComment();
                    }
                  }}
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                  {isSubmittingComment ? "..." : "Post"}
                </button>
              </div>

              {/* Comments List */}
              {isLoadingComments ? (
                <div className="text-center text-gray-500 text-sm py-2">
                  Loading comments...
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <img
                        className="w-8 h-8 rounded-full object-cover"
                        src={comment.author.image ?? "/default-avatar.png"}
                        alt={comment.author.name ?? comment.author.username}
                      />
                      <div className="flex-1 bg-gray-900 rounded-2xl px-3 py-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold">
                            {comment.author.name ?? comment.author.username}
                          </span>
                          <span className="text-gray-500">
                            @{comment.author.username}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SquareBox>
  );
}

