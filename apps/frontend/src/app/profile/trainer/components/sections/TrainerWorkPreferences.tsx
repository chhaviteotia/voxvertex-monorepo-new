"use client";

import React, { useState, useEffect } from "react";
import { Edit2, Plane } from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import {
  useGetCurrentExpertQuery,
  useUpdateProfileMutation,
} from "@/store/api/expertApi";
import EditAvailabilityPreferencesModal from "../modals/EditWorkPreferencesModal";
import { toast } from "react-hot-toast";
import { WorkPreferences } from "@/store/api/expertApi";

// Mapping functions to convert backend values to display format
const mapWorkArrangement = (value: string): string => {
  const mapping: { [key: string]: string } = {
    "contract-based": "Contract-based projects",
    "day-rate": "Day-rate consulting",
    freelance: "Freelance/Project-based",
    retainer: "Retainer-based",
    hourly: "Hourly consulting",
  };
  return mapping[value] || value;
};

const mapSessionDuration = (value: string): string => {
  const mapping: { [key: string]: string } = {
    "half-day": "Half-day",
    "full-day": "Full-day",
    "multi-day": "Multi-day",
  };
  return mapping[value] || value;
};

const mapGeographicPreference = (value: string): string => {
  const mapping: { [key: string]: string } = {
    remote: "Remote only",
    "on-site": "On-site only",
    hybrid: "Hybrid (willing to travel)",
  };
  return mapping[value] || value;
};

export default function TrainerWorkPreferences() {
  const { user } = useExpertAuth();
  const { data: currentUserData, refetch } = useGetCurrentExpertQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);

  const trainerUser = user || currentUserData?.user;
  const workPreferences = trainerUser?.workPreferences;

  // Convert backend data to display format
  const workArrangements =
    workPreferences?.workArrangements?.map(mapWorkArrangement) || [];
  const sessionDurations =
    workPreferences?.sessionDurations?.map((duration) => ({
      label: mapSessionDuration(duration),
      selected: true, // All selected durations are shown
    })) || [];
  const geographicPreference = workPreferences?.geographicPreference?.[0]
    ? mapGeographicPreference(workPreferences.geographicPreference[0])
    : "";

  // Determine travel willingness display based on selection
  const travelWillingnessValue = workPreferences?.travelWillingness?.[0] || "";
  const travelWillingness =
    travelWillingnessValue === "no"
      ? "No"
      : travelWillingnessValue === "yes"
      ? workPreferences?.travelDetails || "Yes, I am willing to travel"
      : "";

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Work Preferences
        </h3>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="space-y-6">
        {workArrangements.length === 0 &&
        sessionDurations.length === 0 &&
        !geographicPreference &&
        !travelWillingness ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No work preferences added yet. Click the edit button to add your
            work preferences.
          </p>
        ) : (
          <>
            {/* Preferred Work Arrangements */}
            {workArrangements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Preferred Work Arrangements
                </h4>
                <div className="flex flex-wrap gap-2">
                  {workArrangements.map((arrangement, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-teal-50 text-teal-700 text-sm font-medium rounded-full border border-teal-200 flex items-center gap-2"
                    >
                      {arrangement}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Session Duration Preference */}
            {sessionDurations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Session Duration Preference
                </h4>
                <div className="flex flex-wrap gap-2">
                  {sessionDurations.map((duration, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 text-sm font-medium rounded-full border ${
                        duration.selected
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {duration.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Geographic Preference */}
            {geographicPreference && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Geographic Preference
                </h4>
                <span className="px-3 py-1 bg-orange-50 text-orange-700 text-sm font-medium rounded-full border border-orange-200">
                  {geographicPreference}
                </span>
              </div>
            )}

            {/* Travel Willingness */}
            {travelWillingness && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Travel Willingness
                </h4>
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {travelWillingness}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Availability Preferences Modal */}
      <EditAvailabilityPreferencesModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={async (data: WorkPreferences) => {
          try {
            const result = await updateProfile({
              workPreferences: data,
            }).unwrap();

            toast.success(
              result.message || "Work preferences updated successfully"
            );

            // Refetch user data to get updated work preferences
            await refetch();

            setIsEditing(false);
          } catch (error: any) {
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Failed to update work preferences. Please try again.";
            toast.error(errorMessage);
            console.error("Work preferences update error:", error);
          }
        }}
        initialData={
          workPreferences || {
            workArrangements: [],
            sessionDurations: [],
            geographicPreference: [],
            travelWillingness: [],
            travelDetails: "",
          }
        }
      />
    </div>
  );
}
