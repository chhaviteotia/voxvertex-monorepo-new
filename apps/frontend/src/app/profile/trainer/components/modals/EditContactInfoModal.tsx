"use client";

import React, { useState } from "react";
import { X, Check, Mail, Phone, Globe, Linkedin, Twitter } from "lucide-react";

interface EditContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContactInfoData) => void;
  initialData?: ContactInfoData;
}

export interface ContactInfoData {
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  twitter: string;
}

export default function EditContactInfoModal({
  isOpen,
  onClose,
  onSave,
  initialData = {
    email: "",
    phone: "",
    website: "",
    linkedin: "",
    twitter: "",
  },
}: EditContactInfoModalProps) {
  const [formData, setFormData] = useState<ContactInfoData>(initialData);
  const [websiteError, setWebsiteError] = useState<string>("");

  // Update local state when initialData changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setWebsiteError(""); // Clear errors when modal opens
    }
  }, [initialData, isOpen]);

  // Validate website URL
  const validateWebsite = (url: string): boolean => {
    if (!url || url.trim() === "") {
      setWebsiteError(""); // Empty is allowed (optional field)
      return true;
    }

    // Add protocol if missing
    let urlToValidate = url.trim();
    if (!urlToValidate.match(/^https?:\/\//i)) {
      urlToValidate = `https://${urlToValidate}`;
    }

    try {
      const urlObj = new URL(urlToValidate);
      // Check if it's a valid HTTP/HTTPS URL
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        setWebsiteError(
          "Please enter a valid website URL (http:// or https://)"
        );
        return false;
      }
      // Check if hostname is valid (has at least one dot or is localhost)
      if (
        !urlObj.hostname ||
        (!urlObj.hostname.includes(".") && urlObj.hostname !== "localhost")
      ) {
        setWebsiteError("Please enter a valid website address");
        return false;
      }
      setWebsiteError("");
      return true;
    } catch (error) {
      setWebsiteError(
        "Please enter a valid website address (e.g., www.example.com or example.com)"
      );
      return false;
    }
  };

  const handleChange = (field: keyof ContactInfoData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validate website in real-time
    if (field === "website") {
      validateWebsite(value);
    }
  };

  const handleSave = () => {
    // Validate website before saving
    if (!validateWebsite(formData.website)) {
      return; // Don't save if validation fails
    }
    onSave(formData);
    onClose();
  };

  const handleClose = () => {
    setFormData(initialData); // Reset to initial value on cancel
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
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-auto z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Teal Background */}
        <div className="bg-teal-600 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Edit Contact Information
            </h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-teal-700 rounded transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  onBlur={(e) => validateWebsite(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none ${
                    websiteError
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="www.example.com or example.com"
                />
              </div>
              {websiteError && (
                <p className="mt-1 text-sm text-red-600">{websiteError}</p>
              )}
              {!websiteError && formData.website && (
                <p className="mt-1 text-xs text-gray-500">
                  Valid website address
                </p>
              )}
            </div>

            {/* LinkedIn Profile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profile
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="linkedin.com/in/yourprofile"
                />
              </div>
            </div>

            {/* Twitter Handle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter Handle
              </label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => handleChange("twitter", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="@yourhandle"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="bg-gray-100 px-6 py-4 flex items-center gap-3 border-t border-gray-200 shrink-0">
          <button
            onClick={handleSave}
            disabled={!!websiteError}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-colors font-medium shadow-sm ${
              websiteError
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
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
