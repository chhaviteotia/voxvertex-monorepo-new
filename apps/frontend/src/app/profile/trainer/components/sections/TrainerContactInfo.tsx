"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, Globe, Linkedin, Twitter, Edit2 } from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import {
  useGetCurrentExpertQuery,
  useUpdateProfileMutation,
} from "@/store/api/expertApi";
import EditContactInfoModal, {
  ContactInfoData,
} from "../modals/EditContactInfoModal";
import { toast } from "react-hot-toast";

export default function TrainerContactInfo() {
  const { user } = useExpertAuth();
  const { data: currentUserData, refetch } = useGetCurrentExpertQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);

  const trainerUser = user || currentUserData?.user;

  // Initialize contact info from user data
  const [contactInfo, setContactInfo] = useState<ContactInfoData>({
    email: trainerUser?.email || "",
    phone: trainerUser?.phoneNumber || "",
    website: trainerUser?.website || "",
    linkedin: trainerUser?.linkedin || "",
    twitter: trainerUser?.twitter || "",
  });

  // Update contact info when user data loads
  useEffect(() => {
    if (trainerUser) {
      setContactInfo({
        email: trainerUser.email || "",
        phone: trainerUser.phoneNumber || "",
        website: trainerUser.website || "",
        linkedin: trainerUser.linkedin || "",
        twitter: trainerUser.twitter || "",
      });
    }
  }, [trainerUser]);

  const handleSave = async (data: ContactInfoData) => {
    try {
      const result = await updateProfile({
        website: data.website,
        linkedin: data.linkedin,
        twitter: data.twitter,
        // Note: email and phone are not updated here as they're account-level fields
        // They should be updated through a separate account settings flow
      }).unwrap();

      toast.success(
        result.message || "Contact information updated successfully"
      );

      // Refetch user data to get updated contact info
      await refetch();

      setIsEditing(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update contact information. Please try again.";
      toast.error(errorMessage);
      console.error("Contact info update error:", error);
    }
  };

  const contactItems = [
    {
      icon: Mail,
      label: "Email",
      value: contactInfo.email,
      href: `mailto:${contactInfo.email}`,
    },
    {
      icon: Phone,
      label: "Phone",
      value: contactInfo.phone,
      href: `tel:${contactInfo.phone}`,
    },
    {
      icon: Globe,
      label: "Website",
      value: contactInfo.website,
      href: `https://${contactInfo.website}`,
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: contactInfo.linkedin,
      href: `https://${contactInfo.linkedin}`,
    },
    {
      icon: Twitter,
      label: "Twitter",
      value: contactInfo.twitter,
      href: `https://twitter.com/${contactInfo.twitter.replace("@", "")}`,
    },
  ];

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Contact Info</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="space-y-3">
          {contactItems.map((item, index) => {
            const Icon = item.icon;
            // Only show items that have values
            if (!item.value || item.value.trim() === "") {
              return null;
            }
            return (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-700 hover:text-teal-600 transition-colors"
              >
                <Icon className="w-5 h-5 text-gray-400 shrink-0" />
                <span className="text-sm">{item.value}</span>
              </a>
            );
          })}
          {contactItems.every(
            (item) => !item.value || item.value.trim() === ""
          ) && (
            <p className="text-sm text-gray-500 text-center py-4">
              No contact information added yet. Click the edit button to add
              your contact details.
            </p>
          )}
        </div>
      </div>

      {/* Edit Contact Info Modal */}
      <EditContactInfoModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleSave}
        initialData={contactInfo}
      />
    </>
  );
}
