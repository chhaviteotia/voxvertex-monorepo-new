"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, Plus } from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import {
  useGetCurrentExpertQuery,
  useUpdateProfileMutation,
} from "@/store/api/expertApi";
import EditCertificationsModal from "../modals/EditCertificationsModal";
import { toast } from "react-hot-toast";
import { Certification } from "@/store/api/expertApi";

// Local interface for display (with id for React keys)
interface CertificationWithId extends Certification {
  id: number | string;
}

export default function TrainerCertifications() {
  const { user } = useExpertAuth();
  const { data: currentUserData, refetch } = useGetCurrentExpertQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const trainerUser = user || currentUserData?.user;
  const userCertifications = trainerUser?.certifications || [];

  // Convert backend certifications to display format (with id for React keys)
  const [professionalCerts, setProfessionalCerts] = useState<
    CertificationWithId[]
  >([]);

  // Update certifications when user data loads
  useEffect(() => {
    if (userCertifications.length > 0) {
      const certificationsWithIds: CertificationWithId[] =
        userCertifications.map((cert, index) => ({
          ...cert,
          id: cert._id || `temp-${index}`,
        }));
      setProfessionalCerts(certificationsWithIds);
    } else {
      setProfessionalCerts([]);
    }
  }, [userCertifications]);

  return (
    <>
      <div className="space-y-6">
        {/* Professional Certifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Professional Certifications
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            {professionalCerts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No certifications added yet. Click the + button to add your
                certifications.
              </p>
            ) : (
              professionalCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">
                      {cert.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">{cert.issuer}</p>
                    <p className="text-xs text-gray-500">
                      Issued {cert.issued} •{" "}
                      {cert.lifetime
                        ? "Lifetime"
                        : `Valid until ${cert.validUntil}`}
                      {cert.idNumber && ` • ID: ${cert.idNumber}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Certifications Modal */}
      <EditCertificationsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (updatedCertifications) => {
          try {
            // Convert display format (with id) back to backend format (with _id)
            const backendCertifications: Certification[] =
              updatedCertifications.map((cert) => {
                const { id, ...rest } = cert;
                return {
                  ...rest,
                  _id:
                    typeof id === "string" && id.startsWith("temp-")
                      ? undefined
                      : (id as string),
                };
              });

            const result = await updateProfile({
              certifications: backendCertifications,
            }).unwrap();

            toast.success(
              result.message || "Certifications updated successfully"
            );

            // Refetch user data to get updated certifications
            await refetch();

            setIsModalOpen(false);
          } catch (error: any) {
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              "Failed to update certifications. Please try again.";
            toast.error(errorMessage);
            console.error("Certifications update error:", error);
          }
        }}
        initialCertifications={professionalCerts}
      />
    </>
  );
}
