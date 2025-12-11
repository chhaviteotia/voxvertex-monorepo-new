"use client";

import React from "react";
import {
  X,
  Star,
  Archive,
  Trash2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { CheckCircle2 } from "lucide-react";

interface ContactInfoPanelProps {
  contact: {
    name: string;
    role: string;
    avatar: string;
    verified: boolean;
    about?: string;
  };
  onClose: () => void;
}

export default function ContactInfoPanel({
  contact,
  onClose,
}: ContactInfoPanelProps) {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Contact Info</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Profile Card */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-2xl mb-4">
            {contact.avatar}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {contact.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4">{contact.role}</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white border border-gray-300 text-green-600 text-xs font-medium rounded-full">
              Trainer
            </span>
            {contact.verified && (
              <span className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">About</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {contact.about ||
              "Experienced leadership trainer specializing in team building and organizational development."}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Quick Actions
          </h4>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left">
              <Star className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Add to Favorites</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left">
              <Archive className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">
                Archive Conversation
              </span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-600">Delete Conversation</span>
            </button>
          </div>
        </div>

        {/* Shared Media */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Shared Media
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {/* Document */}
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            {/* Image */}
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <ImageIcon className="w-6 h-6 text-gray-600" />
            </div>
            {/* More */}
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <span className="text-xs font-medium text-gray-600">+12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
