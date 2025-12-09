"use client";

import React, { useState, useEffect } from "react";
import { Plus, Check } from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import {
  useGetCurrentExpertQuery,
  useUpdateProfileMutation,
} from "@/store/api/expertApi";
import EditClientTypesServedModal from "../modals/EditClientTypesServedModal";
import { toast } from "react-hot-toast";
import { ClientType } from "@/store/api/expertApi";

export default function TrainerClientTypesServed() {
  const { user } = useExpertAuth();
  const { data: currentUserData, refetch } = useGetCurrentExpertQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);

  const trainerUser = user || currentUserData?.user;
  const userClientTypes = trainerUser?.clientTypesServed || [];

  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);

  // Update client types when user data loads
  useEffect(() => {
    setClientTypes(userClientTypes);
  }, [userClientTypes]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Client Types Served
        </h3>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <Plus className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="space-y-2">
        {clientTypes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No client types added yet. Click the + button to add client types.
          </p>
        ) : (
          clientTypes.map((clientType, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <p className="text-sm text-gray-700">{clientType.name}</p>
            </div>
          ))
        )}
      </div>

      {/* Edit Client Types Served Modal */}
      <EditClientTypesServedModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={async (updatedClientTypes) => {
          try {
            // Remove _id from client types before sending to backend
            const backendClientTypes: ClientType[] = updatedClientTypes.map(
              ({ _id, ...rest }) => rest
            );

            const result = await updateProfile({
              clientTypesServed: backendClientTypes,
            }).unwrap();

            toast.success(
              result.message || "Client types served updated successfully"
            );

            // Refetch user data to get updated client types
            await refetch();

            setIsEditing(false);
          } catch (error: any) {
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Failed to update client types served. Please try again.";
            toast.error(errorMessage);
            console.error("Client types served update error:", error);
          }
        }}
        initialClientTypes={clientTypes}
      />
    </div>
  );
}
