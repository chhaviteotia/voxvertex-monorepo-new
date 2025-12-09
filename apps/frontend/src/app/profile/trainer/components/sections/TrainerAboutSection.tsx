"use client";

import React, { useState } from "react";
import { Edit2 } from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import {
  useGetCurrentExpertQuery,
  useUpdateProfileMutation,
} from "@/store/api/expertApi";
import EditAboutModal from "../modals/EditAboutModal";
import { toast } from "react-hot-toast";

export default function TrainerAboutSection() {
  const { user } = useExpertAuth();
  const { data: currentUserData, refetch } = useGetCurrentExpertQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);

  const trainerUser = user || currentUserData?.user;
  const aboutText = trainerUser?.bio || "";

  const handleSave = async (newAboutText: string) => {
    try {
      const result = await updateProfile({
        bio: newAboutText,
      }).unwrap();

      toast.success(result.message || "About section updated successfully");

      // Refetch user data to get updated bio
      await refetch();

      setIsEditing(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update about section. Please try again.";
      toast.error(errorMessage);
      console.error("About update error:", error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">About</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {aboutText || "No description available."}
        </p>
      </div>

      {/* Edit About Modal */}
      <EditAboutModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleSave}
        initialAbout={aboutText}
      />
    </>
  );
}
