"use client";

import React, { useState } from "react";
import { User2, Heart, MessageCircle, Share2, Bookmark, Send } from "lucide-react";
import { useAuth } from "@/store/hooks";
import { useToggleLikePostMutation, useAddCommentMutation } from "@/store/slices/postsSlice";
import { toast } from "react-hot-toast";

interface BoxProps {
  postId: string;
  name: string;
  role: string;
  verifiedstatus: boolean;
  text: string;
  hashtags?: string[];
  likes?: number;
  comments?: number;
  shares?: number;
  author?: any;
  likedBy?: string[];
  createdAt?: string;
  onPostUpdated?: () => void;
}

const Box = ({ 
  postId, 
  name, 
  role, 
  verifiedstatus, 
  text, 
  hashtags = [], 
  likes = 0, 
  comments = 0, 
  shares = 0,
  author,
  likedBy = [],
  onPostUpdated,
}: BoxProps) => {
  const [showComment, setShowComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();
  const [toggleLike] = useToggleLikePostMutation();
  const [addComment] = useAddCommentMutation();
  const [isLiked, setIsLiked] = useState(
    user?._id && likedBy?.includes(user._id)
  );
  const [currentLikes, setCurrentLikes] = useState(likes);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }

    try {
      await toggleLike(postId).unwrap();
      setIsLiked(!isLiked);
      setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast.error(error?.data?.message || "Failed to like post");
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      await addComment({ postId, content: commentText.trim() }).unwrap();
      setCommentText("");
      setShowComment(false);
      toast.success("Comment added successfully!");
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(error?.data?.message || "Failed to add comment");
    }
  };

  const handleShare = () => {
    if (!user) {
      toast.error("Please login to share posts");
      return;
    }
    // TODO: Implement share functionality
    toast.info("Share feature coming soon");
  };

  return (
    <div className="bg-white rounded-2xl shadow border-none p-6 my-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="bg-green-600 rounded-full p-3">
          <User2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {name}
            {verifiedstatus && (
              <span className="text-green-600 text-sm ml-1">✔</span>
            )}
          </p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>

      {/* Post Text */}
      <p className="text-gray-800 mt-4 leading-relaxed whitespace-pre-wrap">{text}</p>

      {/* Hashtags */}
      {hashtags && hashtags.length > 0 && (
        <div className="flex gap-2 mt-4 flex-wrap">
          {hashtags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Engagement */}
      <div className="flex justify-start gap-3 items-center text-sm text-gray-600 mt-4 border-t pt-3">
        <span>
          <span className="font-medium text-gray-900">{currentLikes}</span> likes
        </span>
        <span>
          <span className="font-medium text-gray-900">{comments}</span> comments
        </span>
        <span>
          <span className="font-medium text-gray-900">{shares}</span> shares
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t text-gray-600">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 hover:text-green-700 ${isLiked ? 'text-green-600' : ''}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          Like
        </button>

        <button
          onClick={() => setShowComment((prev) => !prev)}
          className="flex items-center gap-2 hover:text-green-700"
        >
          <MessageCircle className="w-5 h-5" />
          Comment
        </button>

        <button 
          onClick={handleShare}
          className="flex items-center gap-2 hover:text-green-700"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>

        <Bookmark className="w-5 h-5 hover:text-green-700 cursor-pointer" />
      </div>

      {showComment && (
        <div className="mt-4">
          <div className="flex gap-3 flex-col">
            <div className="w-full flex flex-row items-start gap-2">
              <div className="bg-green-600 rounded-full p-2">
                <User2 className="w-5 h-5 text-white" />
              </div>
              <input
                autoFocus
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none w-full"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleComment();
                  }
                }}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className={`flex bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 gap-2 ${
                  !commentText.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Send className="w-5 h-5"/>
                Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Box;
