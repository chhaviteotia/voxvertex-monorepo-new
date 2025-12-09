"use client";

import React, { useState, useRef } from "react";
import { X, Camera, Upload, Check } from "lucide-react";

interface UploadProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File) => void;
  currentInitials?: string;
}

export default function UploadProfilePictureModal({
  isOpen,
  onClose,
  onSave,
  currentInitials = "TN",
}: UploadProfilePictureModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert("Please select a JPG, PNG, or WEBP image");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    if (selectedFile) {
      onSave(selectedFile);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg mx-auto z-10 overflow-hidden">
        {/* Header with Teal Background */}
        <div className="bg-teal-600 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">
                Upload Profile Picture
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
            Choose a professional photo.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Picture Preview */}
          <div className="flex justify-center mb-6">
            <div className="w-40 h-40 rounded-full bg-[#E58C73] flex items-center justify-center text-white text-5xl font-bold overflow-hidden shadow-md">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                currentInitials
              )}
            </div>
          </div>

          {/* Photo Guidelines */}
          <div className="mb-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Photo Guidelines:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 list-none font-normal">
              <li className="flex items-start gap-2">
                <span className="text-gray-800 mt-0.5">•</span>
                <span className="leading-relaxed">
                  Use a professional, high-quality photo
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-800 mt-0.5">•</span>
                <span className="leading-relaxed">
                  Face should be clearly visible
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-800 mt-0.5">•</span>
                <span className="leading-relaxed">Maximum file size: 5MB</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-800 mt-0.5">•</span>
                <span className="leading-relaxed">
                  Supported formats: JPG, PNG, WEBP
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-800 mt-0.5">•</span>
                <span className="leading-relaxed">Square photos work best</span>
              </li>
            </ul>
          </div>

          {/* Choose Photo Button */}
          <button
            onClick={handleChoosePhoto}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium mb-6 shadow-sm"
          >
            <Upload className="w-5 h-5" />
            Choose Photo
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action Buttons Footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={!selectedFile}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Check className="w-5 h-5" />
              Save Photo
            </button>
            <button
              onClick={handleClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
