"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Target } from "lucide-react";

interface Industry {
  name: string;
}

interface EditIndustriesServedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (industries: Industry[]) => void;
  initialIndustries?: Industry[];
}

const COMMON_INDUSTRIES = [
  "Manufacturing",
  "Retail",
  "Education",
  "Consulting",
  "Pharmaceuticals",
  "Media & Entertainment",
  "Hospitality & Tourism",
  "Real Estate",
  "Energy & Utilities",
  "Automotive",
  "Logistics & Supply Chain",
  "Insurance",
  "Government & Public Sector",
  "Agriculture",
  "Construction",
];

export default function EditIndustriesServedModal({
  isOpen,
  onClose,
  onSave,
  initialIndustries = [],
}: EditIndustriesServedModalProps) {
  const [industries, setIndustries] = useState<Industry[]>(initialIndustries);
  const [newIndustryName, setNewIndustryName] = useState<string>("");

  React.useEffect(() => {
    if (isOpen) {
      setIndustries(initialIndustries);
    }
  }, [initialIndustries, isOpen]);

  const handleAddIndustry = () => {
    if (
      newIndustryName.trim() &&
      !industries.some(
        (ind) => ind.name.toLowerCase() === newIndustryName.trim().toLowerCase()
      )
    ) {
      setIndustries([...industries, { name: newIndustryName.trim() }]);
      setNewIndustryName("");
    }
  };

  const handleQuickAdd = (industryName: string) => {
    if (!industries.some((ind) => ind.name === industryName)) {
      setIndustries([...industries, { name: industryName }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddIndustry();
    }
  };

  const handleDeleteIndustry = (industryName: string) => {
    setIndustries(industries.filter((ind) => ind.name !== industryName));
  };

  const handleSave = () => {
    onSave(industries);
    onClose();
  };

  const handleCancel = () => {
    setIndustries(initialIndustries);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Industries Served
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add Industry Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Industry
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newIndustryName}
                onChange={(e) => setNewIndustryName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter industry name"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
              <button
                onClick={handleAddIndustry}
                disabled={!newIndustryName.trim()}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
          </div>

          {/* Your Industries Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Industries ({industries.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {industries.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No industries added yet.
                </p>
              ) : (
                industries.map((industry) => (
                  <div
                    key={industry.name}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center shrink-0">
                        <Target className="w-3 h-3 text-teal-600" />
                      </div>
                      <span className="text-sm text-gray-700">
                        {industry.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteIndustry(industry.name)}
                      className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Add Common Industries Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Add Common Industries
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {COMMON_INDUSTRIES.map((industry) => {
                const isAdded = industries.some((ind) => ind.name === industry);
                return (
                  <button
                    key={industry}
                    onClick={() => handleQuickAdd(industry)}
                    disabled={isAdded}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <Plus className="w-4 h-4 text-gray-600 shrink-0" />
                    <span className="text-sm text-gray-700">{industry}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Save Industries
          </button>
        </div>
      </div>
    </div>
  );
}
