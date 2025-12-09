"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import {
  useGetCurrentExpertQuery,
  useUpdateProfileMutation,
} from "@/store/api/expertApi";
import EditIndustriesServedModal from "../modals/EditIndustriesServedModal";
import { toast } from "react-hot-toast";
import { Industry } from "@/store/api/expertApi";

export default function TrainerIndustriesServed() {
  const { user } = useExpertAuth();
  const { data: currentUserData, refetch } = useGetCurrentExpertQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);

  const trainerUser = user || currentUserData?.user;
  const userIndustries = trainerUser?.industriesServed || [];

  const [industries, setIndustries] = useState<Industry[]>([]);

  // Update industries when user data loads
  useEffect(() => {
    setIndustries(userIndustries);
  }, [userIndustries]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Industries Served
        </h3>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <Plus className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="space-y-2">
        {industries.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No industries added yet. Click the + button to add industries.
          </p>
        ) : (
          industries.map((industry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <p className="text-sm text-gray-700">{industry.name}</p>
            </div>
          ))
        )}
      </div>

      {/* Edit Industries Served Modal */}
      <EditIndustriesServedModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={async (updatedIndustries) => {
          try {
            // Remove _id from industries before sending to backend
            const backendIndustries: Industry[] = updatedIndustries.map(
              ({ _id, ...rest }) => rest
            );

            const result = await updateProfile({
              industriesServed: backendIndustries,
            }).unwrap();

            toast.success(
              result.message || "Industries served updated successfully"
            );

            // Refetch user data to get updated industries
            await refetch();

            setIsEditing(false);
          } catch (error: any) {
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Failed to update industries served. Please try again.";
            toast.error(errorMessage);
            console.error("Industries served update error:", error);
          }
        }}
        initialIndustries={industries}
      />
    </div>
  );
}
