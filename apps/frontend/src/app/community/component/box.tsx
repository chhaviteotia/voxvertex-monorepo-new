"use client";

import React, { useState } from "react";
import { User2, Heart, MessageCircle, Share2, Bookmark, Send } from "lucide-react";

const Box = ({ name, role, verifiedstatus, text }) => {
  const [showComment, setShowComment] = useState(false);
  const [commentText, setCommentText] = useState("");

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
      <p className="text-gray-800 mt-4 leading-relaxed">{text}</p>

      {/* Hashtags */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {["#Leadership", "#Coaching", "#Innovation"].map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Engagement */}
      <div className="flex justify-start gap-3 items-center text-sm text-gray-600 mt-4 border-t pt-3">
        <span>
          <span className="font-medium text-gray-900">234</span> likes
        </span>
        <span>
            <span className="font-medium text-gray-900">45</span> comments
          </span>
          <span>
            <span className="font-medium text-gray-900">12</span> shares
          </span>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t text-gray-600">
        <button className="flex items-center gap-2 hover:text-green-700">
          <Heart className="w-5 h-5" />
          Like
        </button>

        <button
          onClick={() => setShowComment((prev) => !prev)}
          className="flex items-center gap-2 hover:text-green-700"
        >
          <MessageCircle className="w-5 h-5" />
          Comment
        </button>

        <button className="flex items-center gap-2 hover:text-green-700">
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
            />
            </div>
                
            <div className="flex justify-end">
                <button
              onClick={() => {
                console.log("Comment submitted:", commentText);
                setCommentText("");
              }}
              className="flex bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 gap-2"
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
