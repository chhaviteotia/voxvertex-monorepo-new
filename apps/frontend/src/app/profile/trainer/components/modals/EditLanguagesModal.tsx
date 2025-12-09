"use client";

import React, { useState } from "react";
import { X, Check, Plus, Trash2, ChevronDown, Languages } from "lucide-react";

interface Language {
  name: string;
  proficiency: string;
  canDeliver: boolean;
}

interface EditLanguagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (languages: Language[]) => void;
  initialLanguages?: Language[];
}

const ALL_LANGUAGES = [
  "English",
  "Hindi",
  "Marathi",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Russian",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Turkish",
  "Greek",
  "Hebrew",
  "Vietnamese",
  "Thai",
  "Indonesian",
  "Malay",
  "Bengali",
  "Tamil",
  "Telugu",
  "Urdu",
];

const PROFICIENCY_LEVELS = ["Fluent", "Advanced", "Intermediate", "Basic"];

export default function EditLanguagesModal({
  isOpen,
  onClose,
  onSave,
  initialLanguages = [
    { name: "English", proficiency: "Fluent", canDeliver: true },
    { name: "Hindi", proficiency: "Fluent", canDeliver: true },
    { name: "Marathi", proficiency: "Advanced", canDeliver: true },
    { name: "Spanish", proficiency: "Intermediate", canDeliver: false },
  ],
}: EditLanguagesModalProps) {
  const [languages, setLanguages] = useState<Language[]>(initialLanguages);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedProficiency, setSelectedProficiency] =
    useState<string>("Intermediate");
  const [canDeliverTraining, setCanDeliverTraining] = useState<boolean>(true);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showProficiencyDropdown, setShowProficiencyDropdown] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setLanguages(initialLanguages);
    }
  }, [initialLanguages, isOpen]);

  const handleAddLanguage = () => {
    if (
      selectedLanguage &&
      !languages.some((lang) => lang.name === selectedLanguage)
    ) {
      setLanguages([
        ...languages,
        {
          name: selectedLanguage,
          proficiency: selectedProficiency,
          canDeliver: canDeliverTraining,
        },
      ]);
      setSelectedLanguage("");
      setSelectedProficiency("Intermediate");
      setCanDeliverTraining(true);
    }
  };

  const handleDeleteLanguage = (languageName: string) => {
    setLanguages(languages.filter((lang) => lang.name !== languageName));
  };

  const handleToggleCanDeliver = (languageName: string) => {
    setLanguages(
      languages.map((lang) =>
        lang.name === languageName
          ? { ...lang, canDeliver: !lang.canDeliver }
          : lang
      )
    );
  };

  const handleSave = () => {
    onSave(languages);
    onClose();
  };

  const handleCancel = () => {
    setLanguages(initialLanguages);
    onClose();
  };

  if (!isOpen) return null;

  const availableLanguages = ALL_LANGUAGES.filter(
    (lang) => !languages.some((l) => l.name === lang)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-teal-600 px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Languages className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                Edit Languages
              </h2>
              <p className="text-sm text-white/90 mt-1">
                Manage languages you speak and can deliver training in
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-teal-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add New Language Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Language
            </h3>
            <div className="space-y-4">
              {/* Language and Proficiency Level - Horizontal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Language Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLanguageDropdown(!showLanguageDropdown);
                        setShowProficiencyDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                    >
                      <span
                        className={
                          selectedLanguage ? "text-gray-900" : "text-gray-500"
                        }
                      >
                        {selectedLanguage || "Select language..."}
                      </span>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>
                    {showLanguageDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowLanguageDropdown(false)}
                        />
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {availableLanguages.map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => {
                                setSelectedLanguage(lang);
                                setShowLanguageDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Proficiency Level Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proficiency Level <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProficiencyDropdown(!showProficiencyDropdown);
                        setShowLanguageDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                    >
                      <span className="text-gray-900">
                        {selectedProficiency}
                      </span>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>
                    {showProficiencyDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowProficiencyDropdown(false)}
                        />
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                          {PROFICIENCY_LEVELS.map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => {
                                setSelectedProficiency(level);
                                setShowProficiencyDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Can Deliver Training Checkbox */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canDeliverTraining}
                    onChange={(e) => setCanDeliverTraining(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">
                    Can deliver training in this language
                  </span>
                </label>
              </div>

              {/* Add Language Button */}
              <button
                onClick={handleAddLanguage}
                disabled={!selectedLanguage}
                className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Add Language
              </button>
            </div>
          </div>

          {/* Your Languages Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Languages ({languages.length})
            </h3>
            <div className="space-y-3">
              {languages.map((language) => (
                <div
                  key={language.name}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {language.name}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200">
                      {language.proficiency}
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={language.canDeliver}
                        onChange={() => handleToggleCanDeliver(language.name)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">
                        Can deliver training
                      </span>
                    </label>
                  </div>
                  <button
                    onClick={() => handleDeleteLanguage(language.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Save Languages ({languages.length})
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
