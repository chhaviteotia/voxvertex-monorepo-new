"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Image,
  Video,
  Trophy,
  Lightbulb,
  Calendar,
  Plus,
} from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (data: { type: string; content: string; tags: string }) => void;
  onSaveDraft: (data: { type: string; content: string; tags: string }) => void;
  editingDraft?: any;
}

const POST_TYPES = [
  {
    id: "article",
    label: "Write Article",
    icon: FileText,
    iconColor: "text-green-600",
  },
  {
    id: "image",
    label: "Share Image",
    icon: Image,
    iconColor: "text-orange-600",
  },
  {
    id: "video",
    label: "Upload Video",
    icon: Video,
    iconColor: "text-purple-600",
  },
  {
    id: "celebrate",
    label: "Celebrate",
    icon: Trophy,
    iconColor: "text-teal-600",
  },
  {
    id: "insight",
    label: "Share Insight",
    icon: Lightbulb,
    iconColor: "text-orange-600",
  },
  {
    id: "event",
    label: "Announce Event",
    icon: Calendar,
    iconColor: "text-purple-600",
  },
];

export default function CreatePostModal({
  isOpen,
  onClose,
  onPublish,
  onSaveDraft,
  editingDraft,
}: CreatePostModalProps) {
  const [selectedType, setSelectedType] = useState("article");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  // Pre-fill form when editing draft
  useEffect(() => {
    if (editingDraft && isOpen) {
      setSelectedType(editingDraft.type || "article");
      setContent(editingDraft.content || "");
      setTags(editingDraft.hashtags?.join(", ") || "");
    } else if (!editingDraft && isOpen) {
      // Reset form when creating new
      setSelectedType("article");
      setContent("");
      setTags("");
    }
  }, [editingDraft, isOpen]);

  if (!isOpen) return null;

  const handlePublish = () => {
    if (!content.trim()) return;
    onPublish({
      type: selectedType,
      content,
      tags,
    });
    // Reset form
    setContent("");
    setTags("");
    setSelectedType("article");
    onClose();
  };

  const handleSaveDraft = () => {
    // Allow saving draft even with empty content
    onSaveDraft({
      type: selectedType,
      content,
      tags,
    });
    // Reset form
    setContent("");
    setTags("");
    setSelectedType("article");
    onClose();
  };

  const handleClose = () => {
    setContent("");
    setTags("");
    setSelectedType("article");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-[#fffbf5] rounded-2xl shadow-2xl w-full max-w-xl mx-auto z-10 overflow-hidden border-2 border-gray-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-gray-300 bg-[#fffbf5]">
          <h2 className="text-xl font-semibold text-gray-900">Create a post</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 bg-[#fffbf5]">
          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Post Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {POST_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? "bg-green-50 border-green-600 text-green-700"
                        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isSelected ? type.iconColor : type.iconColor
                      }`}
                    />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none bg-white text-sm"
              placeholder="What do you want to share with your network?"
            />
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-sm"
              placeholder="e.g., Leadership, AI, Workshop"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t-2 border-gray-300 flex items-center gap-3 bg-[#fffbf5]">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium text-sm"
          >
            Save as Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={!content.trim()}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Plus className="w-4 h-4" />
            Publish Post
          </button>
        </div>
      </div>
    </div>
  );
}
