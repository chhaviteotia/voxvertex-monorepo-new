"use client";

import React, { useState, useEffect } from "react";
import { Plus, GraduationCap } from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import {
  useGetCurrentExpertQuery,
  useUpdateProfileMutation,
} from "@/store/api/expertApi";
import EditEducationModal from "../modals/EditEducationModal";
import { toast } from "react-hot-toast";
import { Education } from "@/store/api/expertApi";

// Local interface for display (with id for React keys)
interface EducationWithId extends Education {
  id: number | string;
}

export default function TrainerEducation() {
  const { user } = useExpertAuth();
  const { data: currentUserData, refetch } = useGetCurrentExpertQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const trainerUser = user || currentUserData?.user;
  const userEducation = trainerUser?.education || [];

  // Convert backend education to display format (with id for React keys)
  const [education, setEducation] = useState<EducationWithId[]>([]);

  // Update education when user data loads
  useEffect(() => {
    if (userEducation.length > 0) {
      const educationWithIds: EducationWithId[] = userEducation.map(
        (edu, index) => ({
          ...edu,
          id: edu._id || `temp-${index}`,
        })
      );
      setEducation(educationWithIds);
    } else {
      setEducation([]);
    }
  }, [userEducation]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Education</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          {education.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No education added yet. Click the + button to add your education.
            </p>
          ) : (
            education.map((edu) => (
              <div
                key={edu.id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    {edu.degree}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    {edu.institution}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    {edu.fieldOfStudy}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">{edu.location}</p>
                  <p className="text-sm text-gray-500">{edu.year}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Education Modal */}
      <EditEducationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (updatedEducation) => {
          try {
            // Convert display format (with id) back to backend format (with _id)
            const backendEducation: Education[] = updatedEducation.map(
              (edu) => {
                const { id, ...rest } = edu;
                return {
                  ...rest,
                  _id:
                    typeof id === "string" && id.startsWith("temp-")
                      ? undefined
                      : (id as string),
                };
              }
            );

            const result = await updateProfile({
              education: backendEducation,
            }).unwrap();

            toast.success(result.message || "Education updated successfully");

            // Refetch user data to get updated education
            await refetch();

            setIsModalOpen(false);
          } catch (error: any) {
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Failed to update education. Please try again.";
            toast.error(errorMessage);
            console.error("Education update error:", error);
          }
        }}
        initialEducation={education}
      />
    </>
  );
}
