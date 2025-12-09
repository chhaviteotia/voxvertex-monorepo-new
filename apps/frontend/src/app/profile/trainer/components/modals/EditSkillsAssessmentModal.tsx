"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  X,
  Save,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  Heart,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { SkillCategory, SkillsAssessment } from "@/store/api/expertApi";

// Star component for ratings
function Star({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

interface EditSkillsAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SkillsAssessment) => void;
  initialData?: SkillsAssessment;
}

// Default skill categories based on the images
const DEFAULT_SKILL_CATEGORIES: SkillsAssessment = [
  {
    category: "Communication Skills",
    skills: [
      { name: "Verbal Communication", rating: 0, evidence: "" },
      { name: "Written Communication", rating: 0, evidence: "" },
      { name: "Active Listening", rating: 0, evidence: "" },
      { name: "Cultural Competency", rating: 0, evidence: "" },
    ],
  },
  {
    category: "Facilitation Skills",
    skills: [
      { name: "Group Management", rating: 0, evidence: "" },
      { name: "Presentation Techniques", rating: 0, evidence: "" },
      { name: "Engagement Strategies", rating: 0, evidence: "" },
      { name: "Virtual Facilitation", rating: 0, evidence: "" },
    ],
  },
  {
    category: "Instructional Design",
    skills: [
      { name: "Needs Analysis", rating: 0, evidence: "" },
      { name: "Curriculum Design", rating: 0, evidence: "" },
      { name: "Content Development", rating: 0, evidence: "" },
      { name: "Evaluation Methods", rating: 0, evidence: "" },
    ],
  },
  {
    category: "Subject Matter Expertise",
    skills: [
      { name: "Domain Knowledge", rating: 0, evidence: "" },
      { name: "Years in Industry", rating: 0, additionalFields: { years: "" } },
      {
        name: "Key Certifications",
        rating: 0,
        additionalFields: { certifications: "" },
      },
      { name: "Practical Application", rating: 0, evidence: "" },
      { name: "Industry Currency", rating: 0, evidence: "" },
    ],
  },
  {
    category: "Technology & Tools",
    skills: [
      { name: "LMS Platforms", rating: 0, tools: "" },
      { name: "Virtual Training Tools", rating: 0, tools: "" },
      { name: "AI Tools Proficiency", rating: 0, tools: "" },
      { name: "Content Authoring", rating: 0, tools: "" },
    ],
  },
  {
    category: "Emotional Intelligence",
    skills: [
      { name: "Empathy & Rapport Building", rating: 0, evidence: "" },
      { name: "Conflict Resolution", rating: 0, evidence: "" },
      { name: "Inclusivity & Diversity", rating: 0, evidence: "" },
      { name: "Coaching & Feedback", rating: 0, evidence: "" },
    ],
  },
  {
    category: "Business & Strategic Skills",
    skills: [
      { name: "Business Acumen", rating: 0, evidence: "" },
      { name: "Project Management", rating: 0, evidence: "" },
      { name: "Change Management", rating: 0, evidence: "" },
      { name: "Stakeholder Management", rating: 0, evidence: "" },
    ],
  },
];

const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    "Communication Skills": MessageSquare,
    "Facilitation Skills": Users,
    "Instructional Design": BarChart3,
    "Subject Matter Expertise": BarChart3,
    "Technology & Tools": Settings,
    "Emotional Intelligence": Heart,
    "Business & Strategic Skills": BarChart3,
  };
  return iconMap[category] || BarChart3;
};

export default function EditSkillsAssessmentModal({
  isOpen,
  onClose,
  onSave,
  initialData = DEFAULT_SKILL_CATEGORIES,
}: EditSkillsAssessmentModalProps) {
  const router = useRouter();
  const [skillsAssessment, setSkillsAssessment] =
    useState<SkillsAssessment>(initialData);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSkillsAssessment(
        initialData.length > 0 ? initialData : DEFAULT_SKILL_CATEGORIES
      );
    }
  }, [initialData, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleRatingChange = (
    categoryIndex: number,
    skillIndex: number,
    rating: number
  ) => {
    const updated = [...skillsAssessment];
    updated[categoryIndex].skills[skillIndex].rating = rating;
    setSkillsAssessment(updated);
  };

  const handleFieldChange = (
    categoryIndex: number,
    skillIndex: number,
    field: "evidence" | "tools",
    value: string
  ) => {
    const updated = [...skillsAssessment];
    updated[categoryIndex].skills[skillIndex][field] = value;
    setSkillsAssessment(updated);
  };

  const handleAdditionalFieldChange = (
    categoryIndex: number,
    skillIndex: number,
    fieldName: string,
    value: string
  ) => {
    const updated = [...skillsAssessment];
    if (!updated[categoryIndex].skills[skillIndex].additionalFields) {
      updated[categoryIndex].skills[skillIndex].additionalFields = {};
    }
    updated[categoryIndex].skills[skillIndex].additionalFields![fieldName] =
      value;
    setSkillsAssessment(updated);
  };

  const handleSave = () => {
    onSave(skillsAssessment);
    onClose();
  };

  const handleClose = () => {
    setSkillsAssessment(initialData);
    onClose();
    router.push("/profile/trainer");
  };

  const renderStars = (
    categoryIndex: number,
    skillIndex: number,
    rating: number
  ) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => handleRatingChange(categoryIndex, skillIndex, i + 1)}
        className={`w-5 h-5 ${
          i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
        } hover:scale-110 transition-transform cursor-pointer`}
      >
        <Star className="w-full h-full" />
      </button>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#fffbf5] overflow-hidden">
      <div className="antialiased overflow-x-hidden bg-[#fffbf5] h-screen flex">
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

        {/* Sidebar - Fixed on left, hidden on mobile */}
        <div className="hidden lg:block">
          <Suspense
            fallback={
              <div className="fixed left-0 top-0 w-64 h-screen bg-teal-700 animate-pulse" />
            }
          >
            <Sidebar />
          </Suspense>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full lg:ml-64 min-h-screen flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <Header
            title="Profile"
            showMobileMenu={showMobileSidebar}
            onMobileMenuToggle={() => setShowMobileSidebar(true)}
          />

          {/* Content with top margin for header */}
          <div className="flex-1 overflow-y-auto mt-16">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">
                      Trainer Skills Assessment
                    </h1>
                  </div>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Save Assessment
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="space-y-6">
                {skillsAssessment.map((category, categoryIndex) => {
                  const Icon = getCategoryIcon(category.category);
                  return (
                    <div
                      key={categoryIndex}
                      className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-6">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <h3 className="text-base font-semibold text-gray-900">
                          {category.category}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {category.skills.map((skill, skillIndex) => (
                          <div
                            key={skillIndex}
                            className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                          >
                            {/* Skill name on first row */}
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                {skill.name}
                              </span>
                            </div>

                            {/* Stars and rating on second row, below skill name */}
                            <div className="flex items-center gap-2 mb-3">
                              {renderStars(
                                categoryIndex,
                                skillIndex,
                                skill.rating
                              )}
                              <span className="text-sm text-gray-600">
                                {skill.rating}/5
                              </span>
                            </div>

                            {/* Evidence / Proof field */}
                            {skill.evidence !== undefined && (
                              <div className="mt-3">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Evidence / Proof
                                </label>
                                <input
                                  type="text"
                                  value={skill.evidence || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      categoryIndex,
                                      skillIndex,
                                      "evidence",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-gray-50"
                                  placeholder="Enter evidence or proof..."
                                />
                              </div>
                            )}

                            {/* Tools / Platforms field */}
                            {skill.tools !== undefined && (
                              <div className="mt-3">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Tools / Platforms
                                </label>
                                <input
                                  type="text"
                                  value={skill.tools || ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      categoryIndex,
                                      skillIndex,
                                      "tools",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-gray-50"
                                  placeholder="Enter tools or platforms..."
                                />
                              </div>
                            )}

                            {/* Additional fields (like Years in Industry, Key Certifications) */}
                            {skill.additionalFields &&
                              Object.entries(skill.additionalFields).map(
                                ([fieldName, fieldValue]) => (
                                  <div key={fieldName} className="mt-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      {fieldName.charAt(0).toUpperCase() +
                                        fieldName.slice(1)}
                                    </label>
                                    <input
                                      type="text"
                                      value={fieldValue || ""}
                                      onChange={(e) =>
                                        handleAdditionalFieldChange(
                                          categoryIndex,
                                          skillIndex,
                                          fieldName,
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-gray-50"
                                      placeholder={`Enter ${fieldName}...`}
                                    />
                                  </div>
                                )
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
