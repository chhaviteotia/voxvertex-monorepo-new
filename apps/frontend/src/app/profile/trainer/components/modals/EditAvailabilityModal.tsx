"use client";

import React, { useState } from "react";
import { ArrowLeft, Check, Zap } from "lucide-react";

interface EditAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AvailabilityData) => void;
  initialData?: AvailabilityData;
  date: Date;
}

export interface AvailabilityData {
  categories: string[];
  pricingModel: string;
  price: string;
  deliveryMode: string;
  notes: string;
}

const ALL_TRAINING_CATEGORIES = [
  "Soft Skills & Behavioral Training",
  "Technical & Hard Skills Training",
  "Compliance & Regulatory Training",
  "Sales & Customer Service Training",
  "Leadership & Executive Development",
  "HR & People Management Training",
  "Diversity, Equity & Inclusion (DEI) Training",
  "Well-being & Mental Health Training",
  "Onboarding & Orientation Training",
  "Industry-Specific Training",
  "Sustainability & CSR Training",
  "Language & Communication Training",
  "Functional/Department-Specific Training",
  "Certification & Accreditation Training",
  "AI & Emerging Technology Training",
  "Immersive Learning & Simulation Training",
  "Microlearning & Learning Experience Design",
  "Data & Analytics Training",
  "Remote & Hybrid Work Training",
  "Coaching & Mentoring Training",
  "Creativity & Innovation Training",
  "Financial Literacy & Business Acumen Training",
  "Crisis Management & Resilience Training",
  "Train-the-Trainer Programs",
  "Digital Transformation & AI Training",
];

const PRICING_MODELS = [
  "Per Session (VoxCoins/hour)",
  "Per Day Rate (VoxCoins/day)",
  "Per Week Rate (VoxCoins/week)",
  "Monthly Retainer (VoxCoins/month)",
  "Project-Based (VoxCoins/project)",
  "Custom Pricing",
];

const DELIVERY_MODES = ["In-person only", "Virtual only", "Hybrid (flexible)"];

export default function EditAvailabilityModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  date,
}: EditAvailabilityModalProps) {
  const [formData, setFormData] = useState<AvailabilityData>(
    initialData || {
      categories: [],
      pricingModel: "Per Day Rate (VoxCoins/day)",
      price: "5000",
      deliveryMode: "Hybrid (flexible)",
      notes: "Available 9 AM - 6 PM IST",
    }
  );

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const formatDate = (date: Date) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${
      monthNames[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {formatDate(date)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Training Categories */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Training Categories <span className="text-red-500">*</span>
            </label>
            <div className="bg-[#fef9e7] border border-yellow-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {ALL_TRAINING_CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.categories.length} categories selected.
            </p>
          </div>

          {/* Pricing Model */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Pricing Model <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {PRICING_MODELS.map((model) => (
                <label
                  key={model}
                  className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="radio"
                    name="pricingModel"
                    value={model}
                    checked={formData.pricingModel === model}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pricingModel: e.target.value,
                      }))
                    }
                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{model}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price in VoxCoins */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Price in VoxCoins <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500" />
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                placeholder="Enter price"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">1 VoxCoin = ₹1 INR</p>
          </div>

          {/* Delivery Mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Delivery Mode <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {DELIVERY_MODES.map((mode) => (
                <label
                  key={mode}
                  className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="radio"
                    name="deliveryMode"
                    value={mode}
                    checked={formData.deliveryMode === mode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deliveryMode: e.target.value,
                      }))
                    }
                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Additional Notes{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
              placeholder="Enter any additional notes..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Update Availability
          </button>
        </div>
      </div>
    </div>
  );
}
