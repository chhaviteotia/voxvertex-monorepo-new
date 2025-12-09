"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Briefcase,
  Star,
  Edit2,
  Camera,
  CheckCircle2,
  Users,
  Video,
} from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import {
  useGetCurrentExpertQuery,
  useUpdateProfileMutation,
} from "@/store/api/expertApi";
import UploadProfilePictureModal from "../modals/UploadProfilePictureModal";
import EditProfileModal, { EditProfileData } from "../modals/EditProfileModal";
import { toast } from "react-hot-toast";

export default function TrainerProfileHeader() {
  const { user, isLoading: isAuthLoading } = useExpertAuth();
  const {
    data: currentUserData,
    isLoading: isQueryLoading,
    isError,
    error,
    refetch,
  } = useGetCurrentExpertQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("🔍 TrainerProfileHeader Debug:", {
      userFromAuth: user,
      currentUserData,
      isLoading: isAuthLoading || isQueryLoading,
      isError,
      error,
    });
  }, [user, currentUserData, isAuthLoading, isQueryLoading, isError, error]);

  const isLoading = isAuthLoading || isQueryLoading;
  // RTK Query returns the response as-is, so if backend returns { success: true, user: {...} }
  // then currentUserData will be { success: true, user: {...} }
  const trainerUser = user || currentUserData?.user;

  // Handle profile update
  const handleProfileUpdate = async (data: EditProfileData) => {
    try {
      const result = await updateProfile({
        professionalTitle: data.professionalTitle,
        yearsOfExperience: data.yearsOfExperience,
        timeZone: data.timeZone,
        currentLocation: data.currentLocation,
      }).unwrap();

      toast.success(result.message || "Profile updated successfully");

      // Refetch user data to get updated profile
      await refetch();

      setIsEditing(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update profile. Please try again.";
      toast.error(errorMessage);
      console.error("Profile update error:", error);
    }
  };

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-full p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Get user initials for avatar
  const getInitials = (name?: string): string => {
    if (!name) return "TN";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Use actual user data, with sensible fallbacks
  const fullName = trainerUser?.fullName || "Trainer";
  const title =
    trainerUser?.professionalTitle ||
    (trainerUser?.industry
      ? `${trainerUser.industry} Trainer`
      : "Professional Trainer");
  const city = trainerUser?.city || "";
  const country = trainerUser?.country || "";
  const location =
    city && country
      ? `${city}, ${country}`
      : city || country || "Location not set";
  const timeZone = trainerUser?.timeZone || "IST (UTC+5:30)";
  const experience = trainerUser?.yearsOfExperience
    ? `${trainerUser.yearsOfExperience} years experience`
    : null; // Don't show experience if not set
  const rating = 4.9; // TODO: Calculate from user's ratings
  const isAvailable = true; // TODO: Make this dynamic based on user's availability

  // Statistics data
  const stats = [
    { icon: Users, label: "Connections", value: "384" },
    { icon: Briefcase, label: "Clients", value: "43" },
    { icon: Video, label: "Sessions", value: "156" },
    { icon: Star, label: "Rating", value: "4.9" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
      {/* Teal Banner Section - Name at the bottom */}
      <div className="bg-teal-600 relative px-6 pt-24 pb-6">
        {/* Profile Avatar - Overlapping both sections */}
        <div className="absolute left-6 -bottom-10">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-[#E58C73] flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
              {getInitials(fullName)}
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border-2 border-teal-600 shadow-sm"
            >
              <Camera className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Name and Edit Button - At the bottom of teal banner */}
        <div className="ml-36 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>

          {/* Edit Profile Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-teal-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* White Section - Description starts immediately at the top */}
      <div className="px-6 pb-6 pt-2">
        {/* Title - Starts at the beginning of white section, aligned with name */}
        <p className="text-gray-600 text-sm mb-4 ml-36">{title}</p>

        {/* Details in Single Row - Aligned with name */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700 mb-4 ml-36">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{timeZone}</span>
          </div>
          {/* Only show experience if user has set it */}
          {experience && (
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <span>{experience}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>{rating} rating</span>
          </div>
        </div>

        {/* Available Badge - Below the details row */}
        {isAvailable && (
          <div className="mb-6 ml-36">
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Available
            </span>
          </div>
        )}

        {/* Statistics Section - Aligned with name, equal spacing on both sides */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between ml-36 mr-36">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const isLast = index === stats.length - 1;
              return (
                <React.Fragment key={index}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-100 rounded-lg shrink-0">
                      <Icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                  {!isLast && <div className="h-12 w-px bg-gray-200 mx-6" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upload Profile Picture Modal */}
      <UploadProfilePictureModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSave={(file) => {
          // Handle file save - you can implement upload logic here
          console.log("File to upload:", file);
          setIsUploadModalOpen(false);
        }}
        currentInitials={getInitials(fullName)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleProfileUpdate}
      />
    </div>
  );
}
