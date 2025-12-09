"use client";

import React, { useState } from "react";
import { X, FileText, Check } from "lucide-react";

interface EditAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (aboutText: string) => void;
  initialAbout?: string;
}

export default function EditAboutModal({
  isOpen,
  onClose,
  onSave,
  initialAbout = "",
}: EditAboutModalProps) {
  const [aboutText, setAboutText] = useState(initialAbout);
  const maxLength = 1000;

  // Update local state when initialAbout changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setAboutText(initialAbout);
    }
  }, [initialAbout, isOpen]);

  const handleSave = () => {
    onSave(aboutText);
    onClose();
  };

  const handleClose = () => {
    setAboutText(initialAbout); // Reset to initial value on cancel
    onClose();
  };

  const remainingChars = maxLength - aboutText.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-auto z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Teal Background */}
        <div className="bg-teal-600 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">
                Edit About Section
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-teal-700 rounded transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Subtitle inside teal header */}
          <p className="text-sm text-white/90 ml-8">
            Describe your expertise and experience.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* About You Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About You <span className="text-red-500">*</span>
            </label>
            <textarea
              value={aboutText}
              onChange={(e) => {
                if (e.target.value.length <= maxLength) {
                  setAboutText(e.target.value);
                }
              }}
              placeholder="Write a compelling summary of your experience and expertise."
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
            />
            {/* Helper Text and Character Count */}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Write a compelling summary of your experience and expertise.
              </p>
              <span
                className={`text-xs ${
                  remainingChars < 100 ? "text-red-500" : "text-gray-500"
                }`}
              >
                {aboutText.length} / {maxLength}
              </span>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Tips for a great About section:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 list-none">
              <li className="flex items-start gap-2">
                <span className="text-gray-900 mt-0.5">•</span>
                <span>
                  Highlight your years of experience and key expertise areas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 mt-0.5">•</span>
                <span>Mention your training philosophy or approach</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 mt-0.5">•</span>
                <span>Include notable achievements or success stories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 mt-0.5">•</span>
                <span>Describe what makes you unique as a trainer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 mt-0.5">•</span>
                <span>Keep it professional yet personable</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="bg-gray-100 px-6 py-4 flex items-center gap-3 border-t border-gray-200 shrink-0">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
          >
            <Check className="w-5 h-5" />
            Save Changes
          </button>
          <button
            onClick={handleClose}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
