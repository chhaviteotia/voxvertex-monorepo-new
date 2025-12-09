"use client";

import React, { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import {
  useGetCurrentExpertQuery,
  useUpdateProfileMutation,
} from "@/store/api/expertApi";
import EditTrainingCategoriesModal from "../modals/EditTrainingCategoriesModal";
import { toast } from "react-hot-toast";
import { TrainingCategory } from "@/store/api/expertApi";

// Local interface for display (with id for React keys)
interface TrainingCategoryWithId extends TrainingCategory {
  id: string;
}

export default function TrainerTrainingCategories() {
  const { user } = useExpertAuth();
  const { data: currentUserData, refetch } = useGetCurrentExpertQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);

  const trainerUser = user || currentUserData?.user;
  const userTrainingCategories = trainerUser?.trainingCategories || [];

  // Convert backend trainingCategories to display format (with id for React keys)
  const [categories, setCategories] = useState<TrainingCategoryWithId[]>([]);

  // Update categories when user data loads
  useEffect(() => {
    if (userTrainingCategories.length > 0) {
      const categoriesWithIds: TrainingCategoryWithId[] =
        userTrainingCategories.map((cat, index) => ({
          ...cat,
          id: cat._id || `temp-${index}`,
        }));
      setCategories(categoriesWithIds);
    } else {
      setCategories([]);
    }
  }, [userTrainingCategories]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Training Categories & Expertise
        </h3>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="space-y-6">
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No training categories added yet. Click the edit button to add your
            training categories.
          </p>
        ) : (
          categories.map((category, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-gray-900">
                    {category.title}
                  </h4>
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded border border-green-200">
                    {category.level}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {category.experience}
              </p>

              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Sub-topics:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {category.subtopics.map((topic, topicIndex) => (
                    <span
                      key={topicIndex}
                      className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-1">
                  Sample Programs:
                </h5>
                <p className="text-sm text-gray-600">
                  {category.samplePrograms}
                </p>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">
                  Success:
                </h5>
                <p className="text-sm text-gray-600">{category.success}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Training Categories Modal */}
      <EditTrainingCategoriesModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={async (updatedCategories) => {
          try {
            // Convert display format (with id) back to backend format (with _id)
            const backendCategories: TrainingCategory[] = updatedCategories.map(
              (cat) => {
                const { id, ...rest } = cat;
                return {
                  ...rest,
                  _id:
                    typeof id === "string" && id.startsWith("temp-")
                      ? undefined
                      : id,
                };
              }
            );

            const result = await updateProfile({
              trainingCategories: backendCategories,
            }).unwrap();

            toast.success(
              result.message || "Training categories updated successfully"
            );

            // Refetch user data to get updated training categories
            await refetch();

            setIsEditing(false);
          } catch (error: any) {
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Failed to update training categories. Please try again.";
            toast.error(errorMessage);
            console.error("Training categories update error:", error);
          }
        }}
        initialCategories={categories}
      />
    </div>
  );
}
