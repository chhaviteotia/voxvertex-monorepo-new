"use client";

import React, { useState } from "react";
import { X, Send } from "lucide-react";

interface Expert {
  id: string;
  name: string;
  initials: string;
  title: string;
}

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  expert: Expert;
  onSend: (message: string) => void;
}

export default function SendMessageModal({
  isOpen,
  onClose,
  expert,
  onSend,
}: SendMessageModalProps) {
  const [message, setMessage] = useState("Hi, I would like to discuss...");

  if (!isOpen) return null;

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("Hi, I would like to discuss...");
      onClose();
    }
  };

  const handleClose = () => {
    setMessage("Hi, I would like to discuss...");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 relative z-[101]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Send Message
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Send a message to {expert.name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Recipient Information */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold shrink-0">
              {expert.initials}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{expert.name}</h3>
              <p className="text-sm text-gray-600">{expert.title}</p>
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border-2 border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none text-sm text-gray-900 bg-white"
              placeholder="Hi, I would like to discuss..."
            />
          </div>

          {/* Tip */}
          <p className="text-xs text-gray-500 mb-6">
            Introduce yourself and clearly explain what you're looking for.
            Experts typically respond within within 2 hours.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                message.trim()
                  ? "bg-teal-600 hover:bg-teal-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
