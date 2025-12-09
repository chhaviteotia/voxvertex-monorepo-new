"use client";

import React, { useState } from "react";
import { X, Check, Plus, X as XIcon } from "lucide-react";

interface TrainingCategory {
  id: string;
  title: string;
  level: string;
  experience: string;
  subtopics: string[];
  samplePrograms: string;
  success: string;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: TrainingCategory) => void;
  category: TrainingCategory | null;
}

export default function EditCategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
}: EditCategoryModalProps) {
  const [formData, setFormData] = useState<TrainingCategory>(
    category || {
      id: "",
      title: "",
      level: "Expert",
      experience: "",
      subtopics: [],
      samplePrograms: "",
      success: "",
    }
  );
  const [newSubtopic, setNewSubtopic] = useState("");

  React.useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        id: "",
        title: "",
        level: "Expert",
        experience: "",
        subtopics: [],
        samplePrograms: "",
        success: "",
      });
    }
    setNewSubtopic("");
  }, [category, isOpen]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      return;
    }
    onSave({
      ...formData,
      id: formData.id || Date.now().toString(),
    });
    onClose();
  };

  const handleClose = () => {
    setFormData(
      category || {
        id: "",
        title: "",
        level: "Expert",
        experience: "",
        subtopics: [],
        samplePrograms: "",
        success: "",
      }
    );
    setNewSubtopic("");
    onClose();
  };

  const addSubtopic = () => {
    if (
      newSubtopic.trim() &&
      !formData.subtopics.includes(newSubtopic.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        subtopics: [...prev.subtopics, newSubtopic.trim()],
      }));
      setNewSubtopic("");
    }
  };

  const removeSubtopic = (subtopic: string) => {
    setFormData((prev) => ({
      ...prev,
      subtopics: prev.subtopics.filter((s) => s !== subtopic),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubtopic();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-teal-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {category ? "Edit Category" : "Add Category"}
            </h2>
            <p className="text-sm text-white/90 mt-1">
              Configure your training category details.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Category Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                placeholder="Enter category title"
              />
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, level: e.target.value }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              >
                <option value="Expert">Expert</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Beginner">Beginner</option>
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience *
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    experience: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                placeholder="e.g., 15 years of experience"
              />
            </div>

            {/* Sub-topics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub-topics
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSubtopic}
                  onChange={(e) => setNewSubtopic(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Enter sub-topic and press Enter"
                />
                <button
                  onClick={addSubtopic}
                  className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
              {formData.subtopics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.subtopics.map((subtopic, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-700 text-sm font-medium rounded border border-gray-200"
                    >
                      {subtopic}
                      <button
                        onClick={() => removeSubtopic(subtopic)}
                        className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sample Programs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sample Programs
              </label>
              <textarea
                value={formData.samplePrograms}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    samplePrograms: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                placeholder="e.g., Leadership Excellence Program, C-Suite Development Workshop"
              />
            </div>

            {/* Success */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Success Metrics
              </label>
              <textarea
                value={formData.success}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, success: e.target.value }))
                }
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                placeholder="e.g., Trained 200+ leaders across 15 Fortune 500 companies"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.title.trim() || !formData.experience.trim()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5" />
            Save Category
          </button>
        </div>
      </div>
    </div>
  );
}


