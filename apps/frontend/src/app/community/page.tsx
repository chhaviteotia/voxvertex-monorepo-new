"use client";

import React, { useMemo } from "react";
import Header from "../home/components/Header";
import { Commentbox } from "./component/commentbox";
import Box from "./component/box";
import { useGetAllPostsQuery } from "@/store/slices/postsSlice";
import { Loader2 } from "lucide-react";

const Community = () => {
  // Fetch all published posts from all users
  const {
    data: postsData = [],
    isLoading,
    error,
    refetch,
  } = useGetAllPostsQuery({});

  // Format posts for display
  const posts = useMemo(() => {
    if (!Array.isArray(postsData)) return [];

    // Sort posts by creation date (newest first)
    const sortedPosts = [...postsData].sort(
      (a: any, b: any) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    return sortedPosts.map((post: any) => ({
      ...post,
      name: post.author?.fullName || post.author?.firstName + " " + post.author?.lastName || "User",
      role: post.author?.professionalTitle || post.author?.role || "",
      verifiedstatus: post.author?.verified || false,
      text: post.content || "",
      hashtags: post.hashtags || [],
      likes: post.metrics?.likes || 0,
      comments: post.metrics?.comments || post.comments?.length || 0,
      shares: post.metrics?.shares || 0,
      postId: post._id,
      author: post.author,
      likedBy: post.likedBy || [],
    }));
  }, [postsData]);

  const handlePostCreated = () => {
    // Refetch posts after creating a new one
    refetch();
  };

  if (isLoading) {
    return (
      <div className="bg-[#F8F6F3] min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-8">
          <div className="w-[90vw] md:w-[60vw] lg:w-[60vw]">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F8F6F3] min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-8">
          <div className="w-[90vw] md:w-[60vw] lg:w-[60vw]">
            <div className="text-center py-12">
              <p className="text-red-600 mb-2">Error loading posts</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F3] min-h-screen">
      <Header />
      <div className="flex items-center justify-center py-8">
        <div className="w-[90vw] md:w-[60vw] lg:w-[60vw]">
          <Commentbox onPostCreated={handlePostCreated} />
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post: any) => (
              <Box
                key={post.postId}
                postId={post.postId}
                name={post.name}
                role={post.role}
                verifiedstatus={post.verifiedstatus}
                text={post.text}
                hashtags={post.hashtags}
                likes={post.likes}
                comments={post.comments}
                shares={post.shares}
                author={post.author}
                likedBy={post.likedBy}
                createdAt={post.createdAt}
                onPostUpdated={refetch}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
