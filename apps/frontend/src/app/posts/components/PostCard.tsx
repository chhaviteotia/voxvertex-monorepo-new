"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Send,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  useToggleLikePostMutation,
  useAddCommentMutation,
  useSharePostMutation,
  useGetPostByIdQuery,
  useDeletePostMutation,
} from "@/store/api/postsApi";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import { formatRelativeTime } from "@/utils/timeUtils";

interface PostComment {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  likes: number;
}

interface Post {
  id: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    verified: boolean;
    _id?: string; // Author ID for ownership check
  };
  timestamp: string;
  createdAt?: string; // ISO date string for calculating relative time
  badge: string;
  badgeColor: "green" | "blue" | "orange" | "purple";
  content: string;
  hashtags: string[];
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  comments: PostComment[];
  likedBy?: string[]; // Add likedBy array for checking if user liked
}

interface PostCardProps {
  post: Post;
  currentUserAvatar?: string;
  currentUserName?: string;
  onLikeToggle?: () => void; // Callback to notify parent of like/unlike
  onDelete?: () => void; // Callback to notify parent of post deletion
}

export default function PostCard({
  post,
  currentUserAvatar = "PS",
  currentUserName = "User",
  onLikeToggle,
  onDelete,
}: PostCardProps) {
  const { user } = useExpertAuth();
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<PostComment[]>(post.comments || []);
  const [showMenu, setShowMenu] = useState(false);
  const [localLikedBy, setLocalLikedBy] = useState<string[]>(() => {
    // Normalize likedBy array to strings
    if (!post.likedBy || post.likedBy.length === 0) return [];
    return post.likedBy.map((id: any) =>
      typeof id === "string" ? id : id?.toString ? id.toString() : String(id)
    );
  });
  const [localMetrics, setLocalMetrics] = useState(post.metrics);

  // API mutations
  const [toggleLike, { isLoading: isTogglingLike }] =
    useToggleLikePostMutation();
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const [sharePost, { isLoading: isSharing }] = useSharePostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  // Track if we're in the middle of a like operation to prevent reset
  const [isLikeOperationInProgress, setIsLikeOperationInProgress] =
    useState(false);

  // Track the last known post ID to detect when we get a new post
  const [lastPostId, setLastPostId] = useState(post.id);
  const [isInitialized, setIsInitialized] = useState(false);

  // Format timestamp for display
  const formattedTimestamp = useMemo(() => {
    if (post.createdAt) {
      return formatRelativeTime(post.createdAt);
    }
    return post.timestamp || "recently";
  }, [post.createdAt, post.timestamp]);

  // Initialize local state only once when post changes or on mount
  useEffect(() => {
    // Only initialize when post ID changes (new post) or on first mount
    if (post.id !== lastPostId || !isInitialized) {
      setLastPostId(post.id);
      setIsInitialized(true);

      // Initialize state for new post
      if (post.likedBy) {
        const normalizedLikedBy = post.likedBy.map((id: any) =>
          typeof id === "string"
            ? id
            : id?.toString
            ? id.toString()
            : String(id)
        );
        setLocalLikedBy(normalizedLikedBy);
      } else {
        setLocalLikedBy([]);
      }
      if (post.metrics) {
        setLocalMetrics(post.metrics);
      }
      if (post.comments) {
        setComments(post.comments);
      }
    } else {
      // For the same post, update from props if not in the middle of a like operation
      // This ensures that when navigating between views, the state syncs with the cache
      if (!isLikeOperationInProgress) {
        // Update likedBy and metrics from props to sync with cache
        if (post.likedBy) {
          const normalizedLikedBy = post.likedBy.map((id: any) =>
            typeof id === "string"
              ? id
              : id?.toString
              ? id.toString()
              : String(id)
          );
          setLocalLikedBy(normalizedLikedBy);
        }
        if (post.metrics) {
          setLocalMetrics(post.metrics);
        }
        if (post.comments) {
          setComments(post.comments);
        }
      } else {
        // During like operation, only update comments
        if (post.comments) {
          setComments(post.comments);
        }
      }
    }
  }, [
    post.id,
    post.likedBy,
    post.metrics,
    post.comments,
    lastPostId,
    isInitialized,
    isLikeOperationInProgress,
  ]);

  // Get user ID in consistent format once
  const userId = useMemo(() => {
    if (!user?._id) return null;
    const id = user._id;
    return typeof id === "string"
      ? id
      : (id as any)?.toString
      ? (id as any).toString()
      : String(id);
  }, [user?._id]);

  // Check if current user has liked the post
  const isLiked = useMemo(() => {
    if (!userId || !localLikedBy || localLikedBy.length === 0) {
      return false;
    }

    // userId is already normalized from useMemo above
    const found = localLikedBy.some((id) => {
      const idStr =
        typeof id === "string"
          ? id
          : (id as any)?.toString
          ? (id as any).toString()
          : String(id);
      // Use strict equality for comparison
      return idStr === userId;
    });

    return found;
  }, [userId, localLikedBy]);

  const handleLike = async () => {
    if (!userId) {
      console.warn("User ID not available");
      return;
    }

    const wasLiked = isLiked;

    // Mark that we're starting a like operation
    setIsLikeOperationInProgress(true);

    // userId is already normalized from useMemo, use it directly
    // Optimistic update
    if (wasLiked) {
      // Unlike - remove user ID
      setLocalLikedBy((prev) => {
        return prev.filter((id) => {
          const idStr =
            typeof id === "string"
              ? id
              : id?.toString
              ? id.toString()
              : String(id);
          return idStr !== userId;
        });
      });
      setLocalMetrics((prev) => ({
        ...prev,
        likes: Math.max(0, prev.likes - 1),
      }));
    } else {
      // Like - add user ID (only if not already present)
      setLocalLikedBy((prev) => {
        // Check if already in array to avoid duplicates
        const alreadyLiked = prev.some((id) => {
          const idStr =
            typeof id === "string"
              ? id
              : (id as any)?.toString
              ? (id as any).toString()
              : String(id);
          return idStr === userId;
        });
        if (alreadyLiked) return prev;
        // Add the userId (already normalized)
        return [...prev, userId];
      });
      setLocalMetrics((prev) => ({
        ...prev,
        likes: prev.likes + 1,
      }));
    }

    try {
      const result = await toggleLike(post.id).unwrap();

      // Update with server response if available
      if (result?.data?.post) {
        const updatedPost = result.data.post;
        // Ensure likedBy is an array of strings
        const likedByArray = updatedPost.likedBy || [];
        const likedByStrings = likedByArray.map((id: any) => {
          if (typeof id === "string") return id;
          if (id?._id) return String(id._id);
          if (id?.toString) return String(id.toString());
          return String(id);
        });
        // Update state while flag is still true to prevent useEffect from resetting
        setLocalLikedBy(likedByStrings);
        setLocalMetrics(updatedPost.metrics || post.metrics);

        // Notify parent to update stats
        if (onLikeToggle) {
          onLikeToggle();
        }
      } else {
        // If response doesn't have expected structure, refetch might be needed
        console.warn("Unexpected response structure from toggleLike:", result);
      }
    } catch (error: any) {
      console.error("Failed to toggle like:", error);
      console.error("Error details:", error?.data || error?.message || error);
      // Revert optimistic update on error
      if (wasLiked) {
        setLocalLikedBy((prev) => {
          // Check if already present to avoid duplicates
          const alreadyPresent = prev.some((id) => {
            const idStr =
              typeof id === "string"
                ? id
                : (id as any)?.toString
                ? (id as any).toString()
                : String(id);
            return idStr === userId;
          });
          if (alreadyPresent) return prev;
          return [...prev, userId];
        });
        setLocalMetrics((prev) => ({
          ...prev,
          likes: prev.likes + 1,
        }));
      } else {
        setLocalLikedBy((prev) =>
          prev.filter((id) => {
            const idStr =
              typeof id === "string"
                ? id
                : (id as any)?.toString
                ? (id as any).toString()
                : String(id);
            return idStr !== userId;
          })
        );
        setLocalMetrics((prev) => ({
          ...prev,
          likes: Math.max(0, prev.likes - 1),
        }));
      }
    } finally {
      // Reset the flag after operation completes (with a delay to ensure state updates settle)
      // This prevents the useEffect from resetting the state immediately after the API response
      // Use a shorter delay since we're now syncing with cache
      setTimeout(() => {
        setIsLikeOperationInProgress(false);
      }, 200);
    }
  };

  const handleShare = async () => {
    try {
      // Generate shareable link
      const shareableLink = `${window.location.origin}/posts/${post.id}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareableLink);
      
      // Show success message
      alert(`Post link copied to clipboard!\n${shareableLink}`);
      
      // Optimistic update
      setLocalMetrics((prev) => ({
        ...prev,
        shares: prev.shares + 1,
      }));

      // Call API to update share count
      try {
        const result = await sharePost(post.id).unwrap();
        // Update with server response if available
        if (result.data?.post) {
          setLocalMetrics(result.data.post.metrics);
        }
      } catch (apiError) {
        console.error("Failed to update share count:", apiError);
        // Don't revert the optimistic update if clipboard copy succeeded
      }
    } catch (error) {
      console.error("Failed to copy link:", error);
      alert("Failed to copy link. Please try again.");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    // Optimistic update
    const tempComment: PostComment = {
      id: `temp-${Date.now()}`,
      author: currentUserName,
      timestamp: "just now",
      content: commentText.trim(),
      likes: 0,
    };
    setComments((prev) => [...prev, tempComment]);
    setLocalMetrics((prev) => ({
      ...prev,
      comments: prev.comments + 1,
    }));
    const commentTextToSubmit = commentText.trim();
    setCommentText("");

    try {
      const result = await addComment({
        postId: post.id,
        content: commentTextToSubmit,
      }).unwrap();

      if (result.data?.post) {
        const transformedComments = result.data.post.comments.map(
          (comment: any) => ({
            id: comment._id,
            author: comment.author?.fullName || comment.author?.name || "User",
            timestamp: comment.createdAt
              ? new Date(comment.createdAt).toLocaleString()
              : "just now",
            content: comment.content,
            likes: comment.likes || 0,
          })
        );
        setComments(transformedComments);
        setLocalMetrics(result.data.post.metrics);
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      // Revert optimistic update on error
      setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
      setLocalMetrics((prev) => ({
        ...prev,
        comments: Math.max(0, prev.comments - 1),
      }));
      setCommentText(commentTextToSubmit);
    }
  };

  const badgeColors = {
    green: "bg-green-100 text-green-700 border-green-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
  };

  // Check if current user is the author of the post
  const isPostOwner = useMemo(() => {
    if (!user?._id || !post.author._id) {
      // Fallback to name comparison if IDs not available
      return post.author.name === currentUserName;
    }
    const userIdStr =
      typeof user._id === "string" ? user._id : String(user._id);
    const authorIdStr =
      typeof post.author._id === "string"
        ? post.author._id
        : String(post.author._id);
    return userIdStr === authorIdStr;
  }, [user?._id, post.author._id, post.author.name, currentUserName]);

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await deletePost(post.id).unwrap();
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-300 p-6 shadow-sm">
      {/* Author Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold">
            {post.author.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {post.author.name}
              </h3>
              {post.author.verified && (
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-gray-600">{post.author.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{formattedTimestamp}</span>
          <span
            className={`px-2 py-1 text-xs font-medium rounded border ${
              badgeColors[post.badgeColor]
            }`}
          >
            {post.badge}
          </span>
          {/* Three-dot menu - only show for post owner */}
          {isPostOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]">
                    <button
                      onClick={handleDeletePost}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Post
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-line leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Hashtags */}
      {post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.hashtags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Engagement Metrics */}
      <div className="flex items-center gap-6 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Eye className="w-4 h-4" />
          <span>{localMetrics.views.toLocaleString()} views</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Heart className="w-4 h-4" />
          <span>{localMetrics.likes} likes</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <MessageCircle className="w-4 h-4" />
          <span>{localMetrics.comments} comments</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Share2 className="w-4 h-4" />
          <span>{localMetrics.shares} shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={isTogglingLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isLiked
                ? "bg-red-50 text-red-600"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-red-600" : ""}`} />
            <span className="font-medium">Like</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Comment</span>
          </button>
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-medium">Share</span>
          </button>
        </div>
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`p-2 rounded-lg transition-colors ${
            isBookmarked
              ? "bg-yellow-50 text-yellow-600"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Bookmark
            className={`w-5 h-5 ${isBookmarked ? "fill-yellow-600" : ""}`}
          />
        </button>
      </div>

      {/* Comments Section - Show when Comment button is clicked */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Comments ({comments.length})
          </h4>

          {/* Existing Comments */}
          {comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {comments.map((comment) => {
                const isCurrentUser = comment.author === currentUserName;
                const commentAvatar = isCurrentUser
                  ? currentUserAvatar
                  : comment.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();
                return (
                  <div
                    key={comment.id}
                    className="flex gap-3 bg-[#fff5e6] rounded-lg p-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {commentAvatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.author}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
                          <Heart className="w-3 h-3" />
                          <span>Like ({comment.likes})</span>
                        </button>
                        <button className="text-xs text-gray-600 hover:text-gray-900">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Write a Comment Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {currentUserAvatar}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => {
                if (
                  e.key === "Enter" &&
                  commentText.trim() &&
                  !isAddingComment
                ) {
                  handleAddComment();
                }
              }}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim() || isAddingComment}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isAddingComment ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
