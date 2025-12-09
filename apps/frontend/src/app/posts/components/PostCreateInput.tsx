"use client";

import React from "react";

interface PostCreateInputProps {
  userInitials: string;
  onClick: () => void;
}

export default function PostCreateInput({
  userInitials,
  onClick,
}: PostCreateInputProps) {
  return (
    <div
      className="bg-white rounded-xl border-2 border-gray-300 p-4 shadow-sm cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {userInitials}
        </div>
        <input
          type="text"
          placeholder="Share an update, article, or announcement..."
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-[#fffbf5] cursor-pointer"
          readOnly
          onClick={onClick}
        />
      </div>
    </div>
  );
}
