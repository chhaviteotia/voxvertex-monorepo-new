"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Award,
  Trash2,
  Check,
  Edit2,
  Upload,
  FileImage,
} from "lucide-react";

// Local interface for modal (with id for React keys)
interface Certification {
  id: number | string;
  title: string;
  issuer: string;
  issued: string;
  validUntil: string | null;
  idNumber: string | null;
  lifetime: boolean;
}

interface EditCertificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (certifications: Certification[]) => void;
  initialCertifications?: Certification[];
}

export default function EditCertificationsModal({
  isOpen,
  onClose,
  onSave,
  initialCertifications = [],
}: EditCertificationsModalProps) {
  const [certifications, setCertifications] = useState<Certification[]>(
    initialCertifications
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newCertification, setNewCertification] = useState<Certification>({
    id: `temp-${Date.now()}`,
    title: "",
    issuer: "",
    issued: "",
    validUntil: null,
    idNumber: null,
    lifetime: false,
  });

  React.useEffect(() => {
    if (isOpen) {
      setCertifications(initialCertifications);
    }
  }, [initialCertifications, isOpen]);

  const handleAddCertification = () => {
    if (
      newCertification.title.trim() &&
      newCertification.issuer.trim() &&
      newCertification.issued.trim()
    ) {
      // Check if we're editing an existing certification (not a temp ID)
      const existingIndex = certifications.findIndex(
        (cert) =>
          cert.id === newCertification.id &&
          !String(newCertification.id).startsWith("temp-")
      );
      if (existingIndex >= 0) {
        // Update existing certification
        const updated = [...certifications];
        updated[existingIndex] = { ...newCertification };
        setCertifications(updated);
      } else {
        // Add new certification
        setCertifications([
          ...certifications,
          { ...newCertification, id: `temp-${Date.now()}` },
        ]);
      }
      setNewCertification({
        id: `temp-${Date.now()}`,
        title: "",
        issuer: "",
        issued: "",
        validUntil: null,
        idNumber: null,
        lifetime: false,
      });
      setIsAdding(false);
    }
  };

  const handleDeleteCertification = (id: number | string) => {
    setCertifications(certifications.filter((cert) => cert.id !== id));
  };

  const handleSave = () => {
    onSave(certifications);
    onClose();
  };

  const handleCancel = () => {
    setCertifications(initialCertifications);
    setIsAdding(false);
    setNewCertification({
      id: `temp-${Date.now()}`,
      title: "",
      issuer: "",
      issued: "",
      validUntil: null,
      idNumber: null,
      lifetime: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-4xl mx-auto z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Orange Background */}
        <div className="bg-orange-300 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">
                Professional Certifications
              </h2>
            </div>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-orange-300 rounded transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Subtitle inside orange header */}
          <p className="text-sm text-white/90 ml-8">
            Add and manage your certifications
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {/* Add Certification Button */}
          {!isAdding && (
            <div className="mb-6">
              <button
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-300 text-white rounded-lg hover:bg-orange-400 transition-colors font-semibold shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Add Certification
              </button>
            </div>
          )}

          {/* Add New Certification Form */}
          {isAdding && (
            <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-yellow-50">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Add New Certification
              </h3>
              <div className="space-y-4">
                {/* Certification Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certification Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., ICF Certified Professional Coach (PCC)"
                    value={newCertification.title}
                    onChange={(e) =>
                      setNewCertification({
                        ...newCertification,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
                  />
                </div>

                {/* Issuing Body/Organization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issuing Body/Organization{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., International Coach Federation"
                    value={newCertification.issuer}
                    onChange={(e) =>
                      setNewCertification({
                        ...newCertification,
                        issuer: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
                  />
                </div>

                {/* Year Obtained and Validity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Obtained <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 2019"
                      value={newCertification.issued}
                      onChange={(e) =>
                        setNewCertification({
                          ...newCertification,
                          issued: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Validity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Valid until 2026 or Lifetime"
                      value={newCertification.validUntil || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewCertification({
                          ...newCertification,
                          validUntil:
                            value === "Lifetime" ||
                            value.toLowerCase().includes("lifetime")
                              ? null
                              : value,
                          lifetime:
                            value === "Lifetime" ||
                            value.toLowerCase().includes("lifetime"),
                        });
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
                    />
                  </div>
                </div>

                {/* Certification ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certification ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., PCC-IND-2019-0542"
                    value={newCertification.idNumber || ""}
                    onChange={(e) =>
                      setNewCertification({
                        ...newCertification,
                        idNumber: e.target.value || null,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the unique ID or credential number if applicable
                  </p>
                </div>

                {/* Certificate Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Image (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-700 mb-4">
                      Upload a clear image of your certificate
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Image
                    </button>
                    <p className="mt-3 text-xs text-gray-500">
                      Max 5MB • JPG, PNG, or PDF
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddCertification}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-300 text-white rounded-lg hover:bg-orange-400 transition-colors font-medium"
                  >
                    <Check className="w-5 h-5" />
                    Add Certification
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewCertification({
                        id: `temp-${Date.now()}`,
                        title: "",
                        issuer: "",
                        issued: "",
                        validUntil: null,
                        idNumber: null,
                        lifetime: false,
                      });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Your Certifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Certifications ({certifications.length})
            </h3>
            <div className="space-y-3">
              {certifications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No certifications added yet. Click "Add Certification" to get
                  started.
                </p>
              ) : (
                certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900 mb-1">
                        {cert.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {cert.issuer}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          Issued {cert.issued}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          {cert.lifetime
                            ? "Lifetime"
                            : `Valid until ${cert.validUntil}`}
                        </span>
                      </div>
                      {cert.idNumber && (
                        <p className="text-xs text-gray-500">
                          ID: {cert.idNumber}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsAdding(true);
                          setNewCertification(cert);
                        }}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Edit certification"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCertification(cert.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete certification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="bg-white px-6 py-4 flex items-center gap-3 border-t border-gray-200 shrink-0">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-300 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold shadow-sm"
          >
            <Check className="w-5 h-5" />
            Save All Certifications ({certifications.length})
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold shadow-sm"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
