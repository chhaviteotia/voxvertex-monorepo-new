"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  GraduationCap,
  Trash2,
  Check,
  MapPin,
  Calendar,
  Upload,
  FileImage,
} from "lucide-react";

// Local interface for modal (with id for React keys)
interface Education {
  id: number | string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  location: string;
  year: string;
}

interface EditEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (education: Education[]) => void;
  initialEducation?: Education[];
}

export default function EditEducationModal({
  isOpen,
  onClose,
  onSave,
  initialEducation = [],
}: EditEducationModalProps) {
  const [education, setEducation] = useState<Education[]>(initialEducation);
  const [isAdding, setIsAdding] = useState(false);
  const [newEducation, setNewEducation] = useState<Education>({
    id: `temp-${Date.now()}`,
    degree: "",
    institution: "",
    fieldOfStudy: "",
    location: "",
    year: "",
  });

  React.useEffect(() => {
    if (isOpen) {
      setEducation(initialEducation);
    }
  }, [initialEducation, isOpen]);

  const handleAddEducation = () => {
    if (
      newEducation.degree.trim() &&
      newEducation.institution.trim() &&
      newEducation.fieldOfStudy.trim() &&
      newEducation.location.trim() &&
      newEducation.year.trim()
    ) {
      // Check if we're editing an existing education (not a temp ID)
      const existingIndex = education.findIndex(
        (edu) =>
          edu.id === newEducation.id &&
          !String(newEducation.id).startsWith("temp-")
      );
      if (existingIndex >= 0) {
        // Update existing education
        const updated = [...education];
        updated[existingIndex] = { ...newEducation };
        setEducation(updated);
      } else {
        // Add new education
        setEducation([
          ...education,
          { ...newEducation, id: `temp-${Date.now()}` },
        ]);
      }
      setNewEducation({
        id: `temp-${Date.now()}`,
        degree: "",
        institution: "",
        fieldOfStudy: "",
        location: "",
        year: "",
      });
      setIsAdding(false);
    }
  };

  const handleDeleteEducation = (id: number | string) => {
    setEducation(education.filter((edu) => edu.id !== id));
  };

  const handleSave = () => {
    onSave(education);
    onClose();
  };

  const handleCancel = () => {
    setEducation(initialEducation);
    setIsAdding(false);
    setNewEducation({
      id: `temp-${Date.now()}`,
      degree: "",
      institution: "",
      fieldOfStudy: "",
      location: "",
      year: "",
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
      <div className="relative bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-2xl mx-auto z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Light Purple Background */}
        <div className="bg-purple-400 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">
                Academic Education
              </h2>
            </div>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-purple-500 rounded transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Subtitle inside light purple header */}
          <p className="text-sm text-white/90 ml-8">
            Add and manage your academic degrees
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {/* Add Degree Button - Prominent in Content Area */}
          {!isAdding && (
            <div className="mb-6">
              <button
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-colors font-semibold shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Add Degree
              </button>
            </div>
          )}

          {/* Add New Education Form */}
          {isAdding && (
            <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-yellow-50">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Add New Degree
              </h3>
              <div className="space-y-4">
                {/* Degree Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Ph.D. in Organizational Psychology"
                    value={newEducation.degree}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        degree: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Include degree type (e.g., B.A., M.Sc., MBA, Ph.D.)
                  </p>
                </div>

                {/* Field of Study */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field of Study <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Organizational Psychology"
                    value={newEducation.fieldOfStudy}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        fieldOfStudy: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  />
                </div>

                {/* Institution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Indian Institute of Management"
                    value={newEducation.institution}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        institution: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g., Ahmedabad, India"
                      value={newEducation.location}
                      onChange={(e) =>
                        setNewEducation({
                          ...newEducation,
                          location: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                    />
                  </div>
                </div>

                {/* Year Completed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year Completed <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g., 2014"
                      value={newEducation.year}
                      onChange={(e) =>
                        setNewEducation({
                          ...newEducation,
                          year: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                    />
                  </div>
                </div>

                {/* Degree Certificate Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree Certificate Image (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-700 mb-4">
                      Upload a clear image of your degree certificate
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
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
                    onClick={handleAddEducation}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium"
                  >
                    <Check className="w-5 h-5" />
                    Add Degree
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewEducation({
                        id: `temp-${Date.now()}`,
                        degree: "",
                        institution: "",
                        fieldOfStudy: "",
                        location: "",
                        year: "",
                      });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-purple-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Your Academic Degrees */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Academic Degrees ({education.length})
            </h3>
            <div className="space-y-3">
              {education.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No degrees added yet. Click "Add Degree" to get started.
                </p>
              ) : (
                education.map((edu) => (
                  <div
                    key={edu.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-yellow-50 hover:shadow-sm transition-shadow"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900 mb-1">
                        {edu.degree}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        {edu.institution}
                      </p>
                      <p className="text-sm text-gray-500 mb-1">
                        Field of Study: {edu.fieldOfStudy}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{edu.location}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{edu.year}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsAdding(true);
                          setNewEducation(edu);
                        }}
                        className="p-1.5 text-purple-400 hover:bg-purple-50 rounded transition-colors"
                        title="Edit degree"
                      >
                        <GraduationCap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        title="Delete degree"
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
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-colors font-semibold shadow-sm"
          >
            <Check className="w-5 h-5" />
            Save All Education ({education.length})
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
