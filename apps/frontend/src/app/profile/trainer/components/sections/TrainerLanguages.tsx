"use client";

import React, { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import {
  useGetCurrentExpertQuery,
  useUpdateProfileMutation,
} from "@/store/api/expertApi";
import EditLanguagesModal from "../modals/EditLanguagesModal";
import { toast } from "react-hot-toast";
import { Language } from "@/store/api/expertApi";

export default function TrainerLanguages() {
  const { user } = useExpertAuth();
  const { data: currentUserData, refetch } = useGetCurrentExpertQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);

  const trainerUser = user || currentUserData?.user;
  const userLanguages = trainerUser?.languages || [];

  const [languages, setLanguages] = useState<Language[]>([]);

  // Update languages when user data loads
  useEffect(() => {
    setLanguages(userLanguages);
  }, [userLanguages]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Languages</h3>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="space-y-3">
        {languages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No languages added yet. Click the edit button to add your languages.
          </p>
        ) : (
          languages.map((language, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {language.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {language.canDeliver && (
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded border border-green-200">
                    Can deliver training
                  </span>
                )}
                <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200">
                  {language.proficiency}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Languages Modal */}
      <EditLanguagesModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={async (updatedLanguages) => {
          try {
            // Remove _id from languages before sending to backend
            const backendLanguages: Language[] = updatedLanguages.map(
              ({ _id, ...rest }) => rest
            );

            const result = await updateProfile({
              languages: backendLanguages,
            }).unwrap();

            toast.success(result.message || "Languages updated successfully");

            // Refetch user data to get updated languages
            await refetch();

            setIsEditing(false);
          } catch (error: any) {
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Failed to update languages. Please try again.";
            toast.error(errorMessage);
            console.error("Languages update error:", error);
          }
        }}
        initialLanguages={languages}
      />
    </div>
  );
}
