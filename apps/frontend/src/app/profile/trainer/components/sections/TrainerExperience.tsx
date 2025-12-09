"use client";

import React, { useState, useEffect } from "react";
import { Plus, Briefcase, MapPin, Calendar } from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import {
  useGetCurrentExpertQuery,
  useUpdateProfileMutation,
} from "@/store/api/expertApi";
import EditExperienceModal from "../modals/EditExperienceModal";
import { toast } from "react-hot-toast";
import { Experience } from "@/store/api/expertApi";

// Local interface for display (with id for React keys)
interface ExperienceWithId extends Experience {
  id: number | string;
}

export default function TrainerExperience() {
  const { user } = useExpertAuth();
  const { data: currentUserData, refetch } = useGetCurrentExpertQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const trainerUser = user || currentUserData?.user;
  const userExperience = trainerUser?.experience || [];

  // Convert backend experience to display format (with id for React keys)
  const [experience, setExperience] = useState<ExperienceWithId[]>([]);

  // Update experience when user data loads
  useEffect(() => {
    if (userExperience.length > 0) {
      const experienceWithIds: ExperienceWithId[] = userExperience.map(
        (exp, index) => ({
          ...exp,
          id: exp._id || `temp-${index}`,
        })
      );
      setExperience(experienceWithIds);
    } else {
      setExperience([]);
    }
  }, [userExperience]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Work Experience
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          {experience.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No work experience added yet. Click the + button to add your
              experience.
            </p>
          ) : (
            experience.map((exp) => (
              <div
                key={exp.id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    {exp.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{exp.company}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{exp.location}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Experience Modal */}
      <EditExperienceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (updatedExperience) => {
          try {
            // Convert display format (with id) back to backend format (with _id)
            const backendExperience: Experience[] = updatedExperience.map(
              (exp) => {
                const { id, ...rest } = exp;
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
              experience: backendExperience,
            }).unwrap();

            toast.success(
              result.message || "Work experience updated successfully"
            );

            // Refetch user data to get updated experience
            await refetch();

            setIsModalOpen(false);
          } catch (error: any) {
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Failed to update work experience. Please try again.";
            toast.error(errorMessage);
            console.error("Experience update error:", error);
          }
        }}
        initialExperience={experience}
      />
    </>
  );
}
