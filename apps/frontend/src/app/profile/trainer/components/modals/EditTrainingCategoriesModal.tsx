"use client";

import React, { useState, Suspense, useRef } from "react";
import {
  Check,
  ArrowLeft,
  Target,
  BookOpen,
  Edit2,
  Trash2,
  Plus,
  X as XIcon,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

interface TrainingCategory {
  id: string;
  title: string;
  level: string;
  experience: string;
  subtopics: string[];
  samplePrograms: string;
  success: string;
  imageUrl?: string;
  imageFile?: File;
}

interface EditTrainingCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categories: TrainingCategory[]) => void;
  initialCategories?: TrainingCategory[];
}

const ALL_CATEGORIES = [
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

export default function EditTrainingCategoriesModal({
  isOpen,
  onClose,
  onSave,
  initialCategories = [
    {
      id: "1",
      title: "Leadership & Executive Development",
      level: "Expert",
      experience: "15 years of experience",
      subtopics: [
        "Strategic Leadership",
        "Executive Coaching",
        "Change Leadership",
        "Team Leadership",
      ],
      samplePrograms:
        "Leadership Excellence Program, C-Suite Development Workshop",
      success: "Trained 200+ leaders across 15 Fortune 500 companies",
    },
    {
      id: "2",
      title: "Digital Transformation & AI Training",
      level: "Expert",
      experience: "8 years of experience",
      subtopics: [
        "AI Integration",
        "Digital Strategy",
        "Technology Adoption",
        "Innovation Management",
      ],
      samplePrograms:
        "Digital Transformation Bootcamp, AI for Business Leaders",
      success: "Led digital transformation training for 50+ organizations",
    },
    {
      id: "3",
      title: "Soft Skills & Behavioral Training",
      level: "Expert",
      experience: "12 years of experience",
      subtopics: [
        "Communication",
        "Emotional Intelligence",
        "Conflict Resolution",
        "Time Management",
      ],
      samplePrograms: "Essential Soft Skills Workshop, EQ in the Workplace",
      success: "Delivered 300+ soft skills sessions with 4.9/5 rating",
    },
  ],
}: EditTrainingCategoriesModalProps) {
  const [selectedCategories, setSelectedCategories] =
    useState<TrainingCategory[]>(initialCategories);
  const router = useRouter();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<TrainingCategory | null>(null);
  const [formData, setFormData] = useState<TrainingCategory>({
    id: "",
    title: "",
    level: "Intermediate",
    experience: "",
    subtopics: [],
    samplePrograms: "",
    success: "",
    imageUrl: "",
  });
  const [newSubtopic, setNewSubtopic] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedCategories(initialCategories);
    }
  }, [initialCategories, isOpen]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleSave = () => {
    onSave(selectedCategories);
    onClose();
  };

  const handleClose = () => {
    setSelectedCategories(initialCategories);
    onClose();
    router.push("/profile/trainer");
  };

  const toggleCategory = (categoryTitle: string) => {
    const isSelected = selectedCategories.some(
      (cat) => cat.title === categoryTitle
    );
    if (isSelected) {
      // Remove category
      setSelectedCategories((prev) =>
        prev.filter((cat) => cat.title !== categoryTitle)
      );
      // If we were editing this category, close the form
      if (editingCategory?.title === categoryTitle) {
        setEditingCategory(null);
        setImagePreview(null);
      }
    } else {
      // Show form in right panel for new category
      const newCategory: TrainingCategory = {
        id: `temp-${Date.now()}`,
        title: categoryTitle,
        level: "Intermediate",
        experience: "",
        subtopics: [],
        samplePrograms: "",
        success: "",
        imageUrl: "",
      };
      setFormData(newCategory);
      setEditingCategory(newCategory);
      setImagePreview(null);
    }
  };

  const handleEditCategory = (categoryId: string) => {
    const category = selectedCategories.find((cat) => cat.id === categoryId);
    if (category) {
      setEditingCategory(category);
      setFormData(category);
      setImagePreview(category.imageUrl || null);
    }
  };

  const handleAddCategory = () => {
    if (!formData.title.trim() || !formData.experience.trim()) {
      return;
    }
    // If image file is selected, convert to URL for storage (or keep file for upload)
    const categoryToSave: TrainingCategory = {
      ...formData,
      imageUrl: imagePreview || formData.imageUrl || "",
    };

    setSelectedCategories((prev) => {
      const existingIndex = prev.findIndex((cat) => cat.id === formData.id);
      if (existingIndex >= 0) {
        // Update existing category
        return prev.map((cat) =>
          cat.id === formData.id ? categoryToSave : cat
        );
      } else {
        // Add new category
        return [...prev, categoryToSave];
      }
    });
    setEditingCategory(null);
    setFormData({
      id: "",
      title: "",
      level: "Intermediate",
      experience: "",
      subtopics: [],
      samplePrograms: "",
      success: "",
      imageUrl: "",
    });
    setNewSubtopic("");
    setImagePreview(null);
  };

  const handleCancelEdit = () => {
    // If the category was just being added (not saved), remove it from selection
    if (editingCategory && formData.id) {
      const isSaved = selectedCategories.some(
        (cat) => cat.id === formData.id && cat.experience
      );
      if (!isSaved) {
        setSelectedCategories((prev) =>
          prev.filter((cat) => cat.id !== formData.id)
        );
      }
    }
    setEditingCategory(null);
    setFormData({
      id: "",
      title: "",
      level: "Intermediate",
      experience: "",
      subtopics: [],
      samplePrograms: "",
      success: "",
      imageUrl: "",
    });
    setNewSubtopic("");
    setImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, imageFile: file }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageFile: undefined, imageUrl: "" }));
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
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

  const handleDeleteCategory = (id: string) => {
    setSelectedCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const isCategorySelected = (categoryTitle: string) => {
    return selectedCategories.some((cat) => cat.title === categoryTitle);
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
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Profile</span>
              </button>
              <div className="flex-1 text-center">
                <h2 className="text-xl font-semibold text-white">
                  Training Categories & Expertise
                </h2>
                <p className="text-sm text-white/90 mt-1">
                  Select and configure your training specializations.
                </p>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-white text-teal-600 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                <Check className="w-5 h-5" />
                Save All ({selectedCategories.length})
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6 min-h-0">
            <div className="max-w-7xl mx-auto h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full lg:h-auto">
                {/* Left Column - Select Categories */}
                <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full lg:max-h-[calc(100vh-250px)] min-h-0">
                  <div className="flex items-center gap-3 mb-4 shrink-0">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Select Categories
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 shrink-0">
                    Choose from 25+ training categories (
                    {selectedCategories.length} selected)
                  </p>
                  <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
                    {ALL_CATEGORIES.map((category) => {
                      const isSelected = isCategorySelected(category);
                      const isBeingEdited = editingCategory?.title === category;
                      return (
                        <button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                            isBeingEdited
                              ? "bg-teal-50 border-teal-500 text-teal-900"
                              : isSelected
                              ? "bg-teal-50 border-teal-500 text-teal-900"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {category}
                            </span>
                            {isSelected && !isBeingEdited && (
                              <Check className="w-5 h-5 text-teal-600" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column - Your Training Categories or Edit Form */}
                <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full lg:max-h-[calc(100vh-250px)] min-h-0">
                  {editingCategory ? (
                    /* Edit/Add Category Form */
                    <div className="flex flex-col h-full min-h-0">
                      <div className="flex items-center justify-between mb-6 shrink-0">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formData.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Add category details
                          </p>
                        </div>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-6 min-h-0 pb-4">
                        {/* Expertise Level */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Expertise Level *
                          </label>
                          <div className="flex gap-3">
                            {["Beginner", "Intermediate", "Expert"].map(
                              (level) => (
                                <button
                                  key={level}
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      level,
                                    }))
                                  }
                                  className={`px-4 py-2 rounded-lg border-2 transition-colors font-medium ${
                                    formData.level === level
                                      ? "bg-teal-50 border-teal-500 text-teal-900"
                                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                                  }`}
                                >
                                  {level}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Years of Experience */}
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
                            placeholder="Enter years of experience"
                          />
                        </div>

                        {/* Specific Sub-topics/Niches */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Specific Sub-topics/Niches
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newSubtopic}
                              onChange={(e) => setNewSubtopic(e.target.value)}
                              onKeyPress={handleKeyPress}
                              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                              placeholder="e.g., Emotional Intelligence, Conflict Resolution"
                            />
                            <button
                              onClick={addSubtopic}
                              className="p-2.5 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors shrink-0 flex items-center justify-center"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                          {formData.subtopics.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
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

                        {/* Sample Programs Delivered */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sample Programs Delivered
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
                            placeholder="e.g., Leadership Excellence Program, Executive Coaching Workshop, Change Management Bootcamp"
                          />
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Image
                            <span className="text-gray-400 ml-1">
                              (Optional)
                            </span>
                          </label>
                          <div className="space-y-3">
                            {imagePreview || formData.imageUrl ? (
                              <div className="relative">
                                <img
                                  src={imagePreview || formData.imageUrl || ""}
                                  alt="Category preview"
                                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <XIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => imageInputRef.current?.click()}
                                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors"
                              >
                                <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 mb-1">
                                  Click to upload image
                                </p>
                                <p className="text-xs text-gray-400">
                                  PNG, JPG up to 5MB
                                </p>
                              </div>
                            )}
                            <input
                              ref={imageInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                            />
                            {!imagePreview && !formData.imageUrl && (
                              <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-gray-700"
                              >
                                <Upload className="w-4 h-4" />
                                Choose Image
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Success Stories/Outcomes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Success Stories/Outcomes{" "}
                            <span className="text-gray-400">(Optional)</span>
                          </label>
                          <textarea
                            value={formData.success}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                success: e.target.value,
                              }))
                            }
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                            placeholder="e.g., Trained 200+ leaders across 15 Fortune 500 companies with 95% satisfaction rate"
                          />
                        </div>
                      </div>

                      {/* Add Category Button */}
                      <div className="mt-6 pt-6 border-t border-gray-200 shrink-0">
                        <button
                          onClick={handleAddCategory}
                          disabled={
                            !formData.title.trim() ||
                            !formData.experience.trim()
                          }
                          className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-5 h-5" />
                          Add Category
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Category List View */
                    <>
                      <div className="flex items-center gap-3 mb-4 shrink-0">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Your Training Categories ({selectedCategories.length})
                        </h3>
                      </div>
                      <div className="flex-1 space-y-4 overflow-y-auto min-h-0">
                        {selectedCategories.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-8">
                            No categories selected. Select categories from the
                            left panel.
                          </p>
                        ) : (
                          selectedCategories.map((category) => (
                            <div
                              key={category.id}
                              className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-semibold text-gray-900">
                                    {category.title}
                                  </h4>
                                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded border border-green-200">
                                    {category.level}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleEditCategory(category.id)
                                    }
                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteCategory(category.id)
                                    }
                                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </div>

                              {category.imageUrl && (
                                <div className="mb-3">
                                  <img
                                    src={category.imageUrl}
                                    alt={category.title}
                                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                  />
                                </div>
                              )}

                              <p className="text-sm text-gray-600 mb-3">
                                {category.experience}
                              </p>

                              {category.subtopics.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                                    Sub-topics:
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {category.subtopics.map((topic, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200"
                                      >
                                        {topic}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {category.samplePrograms && (
                                <div className="mb-3">
                                  <h5 className="text-sm font-medium text-gray-700 mb-1">
                                    Sample Programs:
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {category.samplePrograms}
                                  </p>
                                </div>
                              )}

                              {category.success && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-1">
                                    Success:
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {category.success}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
