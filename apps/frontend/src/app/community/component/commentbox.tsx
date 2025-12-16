"use client";

import { User2, Video } from 'lucide-react'
import React, { useState, useRef } from 'react'
import { MdPhoto } from 'react-icons/md'
import { useCreatePostMutation } from "@/store/slices/postsSlice";
import { useAuth } from "@/store/hooks";
import { toast } from "react-hot-toast";

interface CommentboxProps {
  onPostCreated?: () => void;
}

export const Commentbox = ({ onPostCreated }: CommentboxProps) => {
  const [content, setContent] = useState("");
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const { user } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter some content before posting");
      return;
    }

    if (!user) {
      toast.error("Please login to create a post");
      return;
    }

    try {
      // Extract hashtags from content
      const hashtagRegex = /#(\w+)/g;
      const hashtags = content.match(hashtagRegex)?.map(tag => tag.substring(1)) || [];

      const result = await createPost({
        content: content.trim(),
        type: 'article',
        hashtags,
      }).unwrap();

      if (result.success) {
        toast.success("Post created successfully!");
        setContent("");
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        throw new Error("Failed to create post");
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(error?.data?.message || error?.message || "Failed to create post");
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className='border border-none rounded-xl shadow p-8 bg-white mb-5'>
        <div className='flex flex-row items-start gap-4'>
            <div className='bg-green-600 rounded-full p-4'>
                <User2 className='w-6 h-6 text-white'/>
            </div>
            <div className='flex-1'>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-2xl h-[20vh] p-4 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder='Share your insights, updates, or achievements...'
                  disabled={isCreating}
                  maxLength={5000}
                />
            </div>
        </div>
        <div className='flex flex-row gap-5 justify-between p-6' >   
            <div className="flex items-center gap-6">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleImageClick}
          >
            <MdPhoto className="w-5 h-5" />
            <p className="text-sm">Photo</p>
          </div>

          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleVideoClick}
          >
            <Video className="w-5 h-5" />
            <p className="text-sm">Video</p>
          </div>
        </div>
            <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isCreating || !content.trim()}
                  className={`flex bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 justify-end ${
                    isCreating || !content.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isCreating ? "Posting..." : "Post"}
                </button>
            </div>

        </div>
        {/* Hidden file inputs */}
        <input
          type="file"
          ref={imageInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            // TODO: Handle image upload
            toast.info("Image upload feature coming soon");
          }}
        />
        <input
          type="file"
          ref={videoInputRef}
          className="hidden"
          accept="video/*"
          onChange={(e) => {
            // TODO: Handle video upload
            toast.info("Video upload feature coming soon");
          }}
        />
    </form>
  )
}
