"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Send,
} from "lucide-react";

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
  };
  timestamp: string;
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
}

interface PostCardProps {
  post: Post;
  currentUserAvatar?: string;
  currentUserName?: string;
}

export default function PostCard({
  post,
  currentUserAvatar = "PS",
  currentUserName = "User",
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<PostComment[]>(post.comments || []);

  const badgeColors = {
    green: "bg-green-100 text-green-700 border-green-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
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
          <span className="text-sm text-gray-500">{post.timestamp}</span>
          <span
            className={`px-2 py-1 text-xs font-medium rounded border ${
              badgeColors[post.badgeColor]
            }`}
          >
            {post.badge}
          </span>
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
          <span>{post.metrics.views.toLocaleString()} views</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Heart className="w-4 h-4" />
          <span>{post.metrics.likes} likes</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <MessageCircle className="w-4 h-4" />
          <span>{post.metrics.comments} comments</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Share2 className="w-4 h-4" />
          <span>{post.metrics.shares} shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isLiked
                ? "bg-red-50 text-red-600"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
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
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
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
                if (e.key === "Enter" && commentText.trim()) {
                  const newComment: PostComment = {
                    id: Date.now().toString(),
                    author: currentUserName,
                    timestamp: "just now",
                    content: commentText.trim(),
                    likes: 0,
                  };
                  setComments([...comments, newComment]);
                  setCommentText("");
                }
              }}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
            />
            <button
              onClick={() => {
                if (commentText.trim()) {
                  const newComment: PostComment = {
                    id: Date.now().toString(),
                    author: currentUserName,
                    timestamp: "just now",
                    content: commentText.trim(),
                    likes: 0,
                  };
                  setComments([...comments, newComment]);
                  setCommentText("");
                }
              }}
              disabled={!commentText.trim()}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Post Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
