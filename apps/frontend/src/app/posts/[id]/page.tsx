"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useGetPostByIdQuery } from "@/store/api/postsApi";
import PostCard from "../components/PostCard";

export default function SharedPostPage() {
  const params = useParams();
  const postId = params?.id as string;

  const { data, isLoading, error } = useGetPostByIdQuery(postId, {
    skip: !postId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffbf5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  const post = data?.data?.post || data?.post;
  
  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#fffbf5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Post not found</p>
          <a
            href="/"
            className="text-teal-600 hover:text-teal-700 underline"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Transform the post data to match PostCard interface
  const author = post.author || {};
  const transformedPost = {
    id: post._id,
    author: {
      name: author.fullName || post.userName || "User",
      role: author.professionalTitle || post.userProfessionalTitle || "Member",
      avatar: (author.fullName || post.userName || "User")
        ? (author.fullName || post.userName || "User")
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U",
      verified: author.verified || false,
      _id: author._id || post.user || post._id,
    },
    timestamp: post.createdAt
      ? new Date(post.createdAt).toLocaleString()
      : "recently",
    createdAt: post.createdAt,
    badge: post.badge || post.category || post.type || "Post",
    badgeColor: (post.badgeColor || "blue") as "green" | "blue" | "orange" | "purple",
    content: post.content || post.caption || post.title || "",
    hashtags: post.hashtags || post.tags || [],
    metrics: {
      views: post.metrics?.views || post.viewsCount || 0,
      likes: post.metrics?.likes || post.likesCount || post.likedBy?.length || 0,
      comments: post.metrics?.comments || post.commentsCount || post.comments?.length || 0,
      shares: post.metrics?.shares || post.sharesCount || post.sharedBy?.length || 0,
    },
    comments: (post.comments || []).map((comment: any) => ({
      id: comment._id,
      author: comment.author?.fullName || comment.author?.name || "User",
      timestamp: comment.createdAt
        ? new Date(comment.createdAt).toLocaleString()
        : "just now",
      content: comment.content,
      likes: comment.likes || 0,
    })),
    likedBy: post.likedBy || post.likes?.map((like: any) =>
      typeof like === "string" ? like : like.user || like._id
    ) || [],
  };

  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* Clean page with only the post - no header, no sidebar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostCard
          post={transformedPost}
          currentUserAvatar="U"
          currentUserName="Guest"
        />
      </div>
    </div>
  );
}

