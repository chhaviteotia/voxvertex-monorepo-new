"use client";

import React, { useState, useEffect } from "react";
import {
  Edit2,
  MessageSquare,
  Settings,
  BarChart3,
  Users,
  Heart,
} from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import {
  useGetCurrentExpertQuery,
  useUpdateProfileMutation,
} from "@/store/api/expertApi";
import EditSkillsAssessmentModal from "../modals/EditSkillsAssessmentModal";
import { toast } from "react-hot-toast";
import { SkillsAssessment } from "@/store/api/expertApi";

// Star component for ratings
function Star({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    "Communication Skills": MessageSquare,
    "Facilitation Skills": Users,
    "Instructional Design": BarChart3,
    "Subject Matter Expertise": BarChart3,
    "Technology & Tools": Settings,
    "Emotional Intelligence": Heart,
    "Business & Strategic Skills": BarChart3,
  };
  return iconMap[category] || BarChart3;
};

export default function TrainerSkillsAssessment() {
  const { user } = useExpertAuth();
  const { data: currentUserData, refetch } = useGetCurrentExpertQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);

  const trainerUser = user || currentUserData?.user;
  const skillsAssessment = trainerUser?.skillsAssessment || [];

  // Helper function to check if a skill has been filled (has rating or any input field)
  const isSkillFilled = (skill: any): boolean => {
    // Check if rating is greater than 0
    if (skill.rating > 0) return true;

    // Check if evidence is filled
    if (skill.evidence && skill.evidence.trim() !== "") return true;

    // Check if tools is filled
    if (skill.tools && skill.tools.trim() !== "") return true;

    // Check if any additionalFields have values
    if (skill.additionalFields) {
      const hasFilledField = Object.values(skill.additionalFields).some(
        (value) => value && String(value).trim() !== ""
      );
      if (hasFilledField) return true;
    }

    return false;
  };

  // Filter categories to only show those with at least one filled skill
  const filteredSkillsAssessment = skillsAssessment
    .map((category) => ({
      ...category,
      skills: category.skills.filter(isSkillFilled), // Only show filled skills within each category
    }))
    .filter((category) => category.skills.length > 0); // Only show categories with at least one filled skill

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Trainer Skills Assessment
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          {filteredSkillsAssessment.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No skills assessment added yet. Click the edit button to add your
              skills assessment.
            </p>
          ) : (
            filteredSkillsAssessment.map((skillCategory, categoryIndex) => {
              const Icon = getCategoryIcon(skillCategory.category);
              return (
                <div
                  key={categoryIndex}
                  className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <h4 className="text-base font-semibold text-gray-900">
                      {skillCategory.category}
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {skillCategory.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="pl-7">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {skill.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {renderStars(skill.rating)}
                            <span className="text-xs text-gray-500 ml-1">
                              {skill.rating}/5
                            </span>
                          </div>
                        </div>
                        {skill.evidence && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              Evidence / Proof
                            </p>
                            <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                              {skill.evidence}
                            </p>
                          </div>
                        )}
                        {skill.tools && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              Tools / Platforms
                            </p>
                            <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                              {skill.tools}
                            </p>
                          </div>
                        )}
                        {skill.additionalFields &&
                          Object.entries(skill.additionalFields).map(
                            ([key, value]) => (
                              <div key={key} className="mt-2">
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </p>
                                <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                                  {value}
                                </p>
                              </div>
                            )
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Skills Assessment Modal */}
      <EditSkillsAssessmentModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={async (data: SkillsAssessment) => {
          try {
            // Remove _id from skills and categories before sending to backend
            const backendData: SkillsAssessment = data.map((category) => ({
              category: category.category,
              skills: category.skills.map(({ _id, ...skill }) => skill),
            }));

            const result = await updateProfile({
              skillsAssessment: backendData,
            }).unwrap();

            toast.success(
              result.message || "Skills assessment updated successfully"
            );

            // Refetch user data to get updated skills assessment
            await refetch();

            setIsEditing(false);
          } catch (error: any) {
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Failed to update skills assessment. Please try again.";
            toast.error(errorMessage);
            console.error("Skills assessment update error:", error);
          }
        }}
        initialData={skillsAssessment.length > 0 ? skillsAssessment : undefined}
      />
    </>
  );
}
