"use client";

import React, { useState, Suspense } from "react";
import { X, Check, Briefcase, Clock, Plane, ArrowLeft } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

interface WorkPreferencesData {
  workArrangements: string[];
  sessionDurations: string[];
  geographicPreference: string[];
  travelWillingness: string[];
  travelDetails: string;
}

interface EditWorkPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorkPreferencesData) => void;
  initialData?: WorkPreferencesData;
}

export default function EditAvailabilityPreferencesModal({
  isOpen,
  onClose,
  onSave,
  initialData = {
    workArrangements: ["contract-based", "day-rate"],
    sessionDurations: ["half-day", "full-day", "multi-day"],
    geographicPreference: ["hybrid"],
    travelWillingness: ["yes"],
    travelDetails: "Pan India + International",
  },
}: EditWorkPreferencesModalProps) {
  const [formData, setFormData] = useState<WorkPreferencesData>(initialData);
  const router = useRouter();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [initialData, isOpen]);

  // Lock body scroll when modal is open - modal container handles scrolling
  React.useEffect(() => {
    if (isOpen) {
      // Prevent body scroll - the fixed modal container will handle scrolling
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleClose = () => {
    setFormData(initialData);
    onClose();
    router.push("/profile/trainer");
  };

  const toggleWorkArrangement = (value: string) => {
    setFormData((prev) => {
      const currentArrangements = prev.workArrangements || [];
      const newArrangements = currentArrangements.includes(value)
        ? currentArrangements.filter((item) => item !== value)
        : [...currentArrangements, value];

      return {
        ...prev,
        workArrangements: newArrangements,
      };
    });
  };

  const toggleSessionDuration = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      sessionDurations: prev.sessionDurations.includes(value)
        ? prev.sessionDurations.filter((item) => item !== value)
        : [...prev.sessionDurations, value],
    }));
  };

  const toggleGeographicPreference = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      geographicPreference: prev.geographicPreference.includes(value)
        ? prev.geographicPreference.filter((item) => item !== value)
        : [...prev.geographicPreference, value],
    }));
  };

  const toggleTravelWillingness = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      travelWillingness: prev.travelWillingness.includes(value)
        ? prev.travelWillingness.filter((item) => item !== value)
        : [...prev.travelWillingness, value],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#fffbf5] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="fixed left-0 top-0 h-screen w-64 bg-teal-700 z-50 lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Trainer Sidebar - Fixed on left, hidden on mobile */}
        <div className="hidden lg:block shrink-0">
          <Suspense
            fallback={
              <div className="w-64 h-screen bg-teal-700 animate-pulse" />
            }
          >
            <Sidebar />
          </Suspense>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full lg:ml-64 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <div className="fixed top-0 left-0 lg:left-64 right-0 z-30 shrink-0">
            <Header
              title="Profile"
              showMobileMenu={showMobileSidebar}
              onMobileMenuToggle={() => setShowMobileSidebar(true)}
            />
          </div>

          {/* Header Banner */}
          <div className="bg-teal-600 px-6 py-4 shrink-0 mt-16">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Profile</span>
              </button>
              <div className="flex-1 text-center">
                <h2 className="text-xl font-semibold text-white">
                  Work Preferences
                </h2>
                <p className="text-sm text-white/90 mt-1">
                  Configure your work preferences.
                </p>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-white text-teal-600 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                <Check className="w-5 h-5" />
                Save Preferences
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6 min-h-0">
            <div className="max-w-4xl mx-auto space-y-6 pb-8">
              {/* Preferred Work Arrangements Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg shrink-0">
                    <Briefcase className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Preferred Work Arrangements
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Select all that apply to your work style.
                    </p>
                    <div className="space-y-3">
                      {[
                        { value: "full-time", label: "Full-time employment" },
                        {
                          value: "contract-based",
                          label: "Contract-based projects",
                        },
                        { value: "day-rate", label: "Day-rate consulting" },
                        { value: "retainer", label: "Retainer agreements" },
                        {
                          value: "freelance",
                          label: "Freelance/Project-based",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={(e) => {
                            // Prevent double triggering when clicking on label
                            const input = e.currentTarget.querySelector(
                              'input[type="checkbox"]'
                            ) as HTMLInputElement;
                            if (input && e.target !== input) {
                              e.preventDefault();
                              toggleWorkArrangement(option.value);
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData.workArrangements?.includes(
                                option.value
                              ) || false
                            }
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleWorkArrangement(option.value);
                            }}
                            className="w-5 h-5 text-teal-600 focus:ring-teal-500 focus:ring-2 border-gray-300 rounded cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferred Session Duration Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg shrink-0">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Preferred Session Duration
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose your preferred training session lengths.
                    </p>
                    <div className="space-y-3">
                      {[
                        { value: "half-day", label: "Half-day" },
                        { value: "full-day", label: "Full-day" },
                        { value: "multi-day", label: "Multi-day" },
                        { value: "ongoing", label: "Ongoing" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.sessionDurations.includes(
                              option.value
                            )}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSessionDuration(option.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 text-teal-600 focus:ring-teal-500 focus:ring-2 border-gray-300 rounded cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Preference Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg shrink-0">
                    <Plane className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Geographic Preference
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      How do you prefer to deliver your training?
                    </p>
                    <div className="space-y-3">
                      {[
                        { value: "remote-only", label: "Remote only" },
                        { value: "in-person-only", label: "In-person only" },
                        {
                          value: "hybrid",
                          label: "Hybrid (willing to travel)",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.geographicPreference.includes(
                              option.value
                            )}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleGeographicPreference(option.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 text-teal-600 focus:ring-teal-500 focus:ring-2 border-gray-300 rounded cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel Willingness Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg shrink-0">
                    <Plane className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Travel Willingness
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Are you willing to travel for training sessions?
                    </p>
                    <div className="space-y-3 mb-4">
                      {[
                        { value: "yes", label: "Yes, I am willing to travel" },
                        { value: "no", label: "No" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.travelWillingness.includes(
                              option.value
                            )}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleTravelWillingness(option.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 text-teal-600 focus:ring-teal-500 focus:ring-2 border-gray-300 rounded cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {formData.travelWillingness.includes("yes") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Travel Distance/Percentage
                        </label>
                        <input
                          type="text"
                          value={formData.travelDetails}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              travelDetails: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                          placeholder="Pan India + International"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Specify your maximum travel distance, region, or
                          percentage of time you're willing to travel.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
