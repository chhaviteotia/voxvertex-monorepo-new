"use client";

import React, { useState, useEffect } from "react";
import { X, User, Check, ChevronDown, MapPin, Clock } from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import { useGetCurrentExpertQuery } from "@/store/api/expertApi";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditProfileData) => void;
}

export interface EditProfileData {
  professionalTitle: string;
  yearsOfExperience: number;
  currentLocation: string;
  timeZone: string;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const { user } = useExpertAuth();
  const { data: currentUserData } = useGetCurrentExpertQuery();
  const trainerUser = user || currentUserData?.user;

  // Initialize form data from user profile or use defaults
  const [formData, setFormData] = useState<EditProfileData>({
    professionalTitle: "",
    yearsOfExperience: 0,
    currentLocation: "",
    timeZone: "IST (UTC+5:30) - India",
  });

  // Update form data when user data loads or modal opens
  useEffect(() => {
    if (trainerUser && isOpen) {
      const location =
        trainerUser?.city && trainerUser?.country
          ? `${trainerUser.city}, ${trainerUser.country}`
          : trainerUser?.city || trainerUser?.country || "";

      setFormData({
        professionalTitle: trainerUser?.professionalTitle || "",
        yearsOfExperience: trainerUser?.yearsOfExperience || 0,
        currentLocation: location,
        timeZone: trainerUser?.timeZone || "IST (UTC+5:30) - India",
      });
    }
  }, [trainerUser, isOpen]);

  const fullName = trainerUser?.fullName || "Trainer";
  const email = trainerUser?.email || "";
  const phoneNumber = trainerUser?.phoneNumber || "";

  const handleChange = (
    field: keyof EditProfileData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  // Common time zones for dropdown
  const timeZones = [
    "IST (UTC+5:30) - India",
    "PST (UTC-8:00) - Pacific",
    "EST (UTC-5:00) - Eastern",
    "GMT (UTC+0:00) - Greenwich",
    "CET (UTC+1:00) - Central European",
  ];

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
              <User className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
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
            Update your professional information
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Note Box and Read-Only Fields Container */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6 space-y-4">
            {/* Note */}
            <p className="text-sm text-gray-700">
              Note: These fields cannot be edited as they are linked to your
              account.
            </p>

            {/* Full Name - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Email Address - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Phone Number - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Editable Form Fields */}
          <div className="space-y-6">
            {/* Professional Title - Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.professionalTitle}
                onChange={(e) =>
                  handleChange("professionalTitle", e.target.value)
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                This appears below your name on your profile
              </p>
            </div>

            {/* Years of Experience - Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience in Training{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) =>
                  handleChange(
                    "yearsOfExperience",
                    parseInt(e.target.value) || 0
                  )
                }
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            {/* Current Location - Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.currentLocation}
                  onChange={(e) =>
                    handleChange("currentLocation", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Format: City, Country
              </p>
            </div>

            {/* Time Zone - Editable Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Zone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <select
                  value={formData.timeZone}
                  onChange={(e) => handleChange("timeZone", e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none bg-white cursor-pointer"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Buttons at Bottom of Content */}
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-200">
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
    </div>
  );
}
