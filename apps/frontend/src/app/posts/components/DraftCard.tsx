"use client";

import React, { useState } from "react";
import {
  FileText,
  Image,
  Video,
  Trophy,
  Lightbulb,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { formatRelativeTime } from "@/utils/timeUtils";

interface DraftCardProps {
  draft: {
    id: string;
    type: string;
    content: string;
    hashtags?: string[];
    createdAt?: string;
    updatedAt?: string;
  };
  onPublish: (draftId: string) => void;
  onEdit: (draft: any) => void;
  onDelete: (draftId: string) => void;
}

const POST_TYPE_ICONS = {
  article: FileText,
  image: Image,
  video: Video,
  celebrate: Trophy,
  insight: Lightbulb,
  event: Calendar,
};

const POST_TYPE_LABELS = {
  article: "Write Article",
  image: "Share Image",
  video: "Upload Video",
  celebrate: "Celebrate",
  insight: "Share Insight",
  event: "Announce Event",
};

export default function DraftCard({
  draft,
  onPublish,
  onEdit,
  onDelete,
}: DraftCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const Icon =
    POST_TYPE_ICONS[draft.type as keyof typeof POST_TYPE_ICONS] || FileText;
  const label =
    POST_TYPE_LABELS[draft.type as keyof typeof POST_TYPE_LABELS] || "Post";

  const timestamp =
    draft.updatedAt || draft.createdAt || new Date().toISOString();
  const formattedTime = formatRelativeTime(timestamp);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-300 p-4 shadow-sm relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-600" />
          <span className="text-base font-semibold text-gray-900">{label}</span>
          <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-medium rounded">
            Draft
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{formattedTime}</span>
          {/* Three-dot menu */}
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
                    onClick={() => {
                      onEdit(draft);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Draft
                  </button>
                  <button
                    onClick={() => {
                      onDelete(draft.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Draft
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <div className="text-sm text-gray-700 whitespace-pre-wrap min-h-[40px]">
          {draft.content || "No content"}
        </div>
        {draft.hashtags && draft.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {draft.hashtags.map((tag, idx) => (
              <span key={idx} className="text-xs text-teal-600 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPublish(draft.id)}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium text-sm"
        >
          Publish Now
        </button>
        <button
          onClick={() => onEdit(draft)}
          className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
