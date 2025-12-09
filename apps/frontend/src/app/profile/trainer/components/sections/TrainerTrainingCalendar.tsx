"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Edit2 } from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import {
  useGetCurrentExpertQuery,
  useUpdateProfileMutation,
} from "@/store/api/expertApi";
import EditTrainingCalendarModal from "../modals/EditTrainingCalendarModal";
import { toast } from "react-hot-toast";
import { TrainingCalendar } from "@/store/api/expertApi";

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Format price for display
const formatPrice = (price: string, priceType: string): string => {
  // Extract the unit from priceType (e.g., "Per Day Rate (VoxCoins/day)" -> "VoxCoins/day")
  const match = priceType.match(/\(([^)]+)\)/);
  const unit = match ? match[1] : "VoxCoins";
  return `${price} ${unit}`;
};

export default function TrainerTrainingCalendar() {
  const { user } = useExpertAuth();
  const { data: currentUserData, refetch } = useGetCurrentExpertQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);

  const trainerUser = user || currentUserData?.user;
  const trainingCalendar = trainerUser?.trainingCalendar || [];

  // Convert backend data to display format
  const availabilities = trainingCalendar.map((item) => ({
    date: formatDate(item.date),
    amount: formatPrice(item.price, item.priceType),
    type: item.mode,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Training Calendar
        </h3>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1.5 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
        >
          Edit Calendar
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {availabilities.length} scheduled{" "}
        {availabilities.length === 1 ? "availability" : "availabilities"}
      </p>

      <div className="space-y-3">
        {availabilities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No scheduled availabilities yet. Click "Edit Calendar" to add your
            availability.
          </p>
        ) : (
          availabilities.map((availability, index) => (
            <div
              key={index}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {availability.date}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {availability.amount}
                </span>
                <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded border border-orange-200">
                  {availability.type}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Training Calendar Modal */}
      <EditTrainingCalendarModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={async (updatedCalendar: TrainingCalendar) => {
          try {
            // Remove _id from calendar items before sending to backend
            const backendCalendar: TrainingCalendar = updatedCalendar.map(
              ({ _id, ...item }) => item
            );

            const result = await updateProfile({
              trainingCalendar: backendCalendar,
            }).unwrap();

            toast.success(
              result.message || "Training calendar updated successfully"
            );

            // Refetch user data to get updated calendar
            await refetch();

            setIsEditing(false);
          } catch (error: any) {
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Failed to update training calendar. Please try again.";
            toast.error(errorMessage);
            console.error("Training calendar update error:", error);
          }
        }}
        initialData={trainingCalendar}
      />
    </div>
  );
}
