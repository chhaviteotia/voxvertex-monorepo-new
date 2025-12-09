"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Briefcase,
  Trash2,
  Check,
  MapPin,
  Calendar,
  Upload,
  FileImage,
} from "lucide-react";
import DatePicker from "./DatePicker";

// Local interface for modal (with id for React keys)
interface Experience {
  id: number | string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

interface EditExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experience: Experience[]) => void;
  initialExperience?: Experience[];
}

export default function EditExperienceModal({
  isOpen,
  onClose,
  onSave,
  initialExperience = [],
}: EditExperienceModalProps) {
  const [experience, setExperience] = useState<Experience[]>(initialExperience);
  const [isAdding, setIsAdding] = useState(false);
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const [newExperience, setNewExperience] = useState<Experience>({
    id: `temp-${Date.now()}`,
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
  });

  React.useEffect(() => {
    if (isOpen) {
      setExperience(initialExperience);
    }
  }, [initialExperience, isOpen]);

  const handleAddExperience = () => {
    if (
      newExperience.title.trim() &&
      newExperience.company.trim() &&
      newExperience.startDate.trim() &&
      (currentlyWorking || newExperience.endDate.trim()) &&
      newExperience.location.trim()
    ) {
      // Check if we're editing an existing experience (not a temp ID)
      const existingIndex = experience.findIndex(
        (exp) =>
          exp.id === newExperience.id &&
          !String(newExperience.id).startsWith("temp-")
      );
      if (existingIndex >= 0) {
        // Update existing experience
        const updated = [...experience];
        updated[existingIndex] = {
          ...newExperience,
          endDate: currentlyWorking ? "Present" : newExperience.endDate,
        };
        setExperience(updated);
      } else {
        // Add new experience
        setExperience([
          ...experience,
          {
            ...newExperience,
            endDate: currentlyWorking ? "Present" : newExperience.endDate,
            id: `temp-${Date.now()}`,
          },
        ]);
      }
      setNewExperience({
        id: `temp-${Date.now()}`,
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        location: "",
        description: "",
      });
      setCurrentlyWorking(false);
      setIsAdding(false);
    }
  };

  const handleDeleteExperience = (id: number) => {
    setExperience(experience.filter((exp) => exp.id !== id));
  };

  const handleSave = () => {
    onSave(experience);
    onClose();
  };

  const handleCancel = () => {
    setExperience(initialExperience);
    setIsAdding(false);
    setCurrentlyWorking(false);
    setNewExperience({
      id: `temp-${Date.now()}`,
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      location: "",
      description: "",
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
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-auto z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Teal Green Background */}
        <div className="bg-teal-600 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-white">
                Work Experience
              </h2>
            </div>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-teal-700 rounded transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Subtitle inside teal green header */}
          <p className="text-sm text-white/90 ml-11">
            Add and manage your professional experience
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {/* Add Experience Button - Prominent in Content Area */}
          {!isAdding && (
            <div className="mb-6">
              <button
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Add Experience
              </button>
            </div>
          )}

          {/* Add New Experience Form */}
          {isAdding && (
            <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-yellow-50">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Add New Experience
              </h3>
              <div className="space-y-4">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Leadership Trainer"
                    value={newExperience.title}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  />
                </div>

                {/* Company/Organization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company/Organization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Global Training Solutions"
                    value={newExperience.company}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        company: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g., Mumbai, India"
                      value={newExperience.location}
                      onChange={(e) =>
                        setNewExperience({
                          ...newExperience,
                          location: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                    />
                  </div>
                </div>

                {/* Start Date and End Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      value={newExperience.startDate}
                      onChange={(value) =>
                        setNewExperience({
                          ...newExperience,
                          startDate: value,
                        })
                      }
                      placeholder="--------, ----"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      value={
                        currentlyWorking ? "Present" : newExperience.endDate
                      }
                      onChange={(value) =>
                        setNewExperience({
                          ...newExperience,
                          endDate: value,
                        })
                      }
                      placeholder="--------, ----"
                      disabled={currentlyWorking}
                    />
                  </div>
                </div>

                {/* I currently work here checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="currentlyWorking"
                    checked={currentlyWorking}
                    onChange={(e) => {
                      setCurrentlyWorking(e.target.checked);
                      if (e.target.checked) {
                        setNewExperience({
                          ...newExperience,
                          endDate: "Present",
                        });
                      }
                    }}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600"
                  />
                  <label
                    htmlFor="currentlyWorking"
                    className="ml-2 text-sm text-gray-700"
                  >
                    I currently work here
                  </label>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe your responsibilities, achievements, and key projects..."
                    value={newExperience.description}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        description: e.target.value,
                      })
                    }
                    rows={5}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none resize-none"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Highlight your training achievements and impact
                  </p>
                </div>

                {/* Experience Document Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Document (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-700 mb-4">
                      Upload a clear image of your experience certificate or
                      document
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-teal-300 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium"
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
                    onClick={handleAddExperience}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    <Check className="w-5 h-5" />
                    Add Experience
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setCurrentlyWorking(false);
                      setNewExperience({
                        id: `temp-${Date.now()}`,
                        title: "",
                        company: "",
                        startDate: "",
                        endDate: "",
                        location: "",
                        description: "",
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

          {/* Your Experience */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Experience ({experience.length})
            </h3>
            <div className="space-y-3">
              {experience.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No experience added yet. Click "Add Experience" to get
                  started.
                </p>
              ) : (
                experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-yellow-50 hover:shadow-sm transition-shadow"
                  >
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900 mb-1">
                        {exp.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {exp.company}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{exp.location}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {exp.startDate} - {exp.endDate}
                          </span>
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsAdding(true);
                          setNewExperience(exp);
                          setCurrentlyWorking(exp.endDate === "Present");
                        }}
                        className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                        title="Edit experience"
                      >
                        <Briefcase className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold shadow-sm"
          >
            <Check className="w-5 h-5" />
            Save All Experience ({experience.length})
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
