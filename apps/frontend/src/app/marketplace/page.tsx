"use client";

import React, { useState } from "react";
import {
  UserPlus,
  MessageSquare,
  Star,
  Users,
  Award,
  Verified,
  ChevronUp,
  ChevronDown,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../home/components/Header";
import ConnectExpertModal from "./components/ConnectExpertModal";
import SendMessageModal from "./components/SendMessageModal";
import { useGetExpertsQuery, type Expert } from "@/store/api/marketplaceApi";

export default function MarketplacePage() {
  const router = useRouter();
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageExpert, setMessageExpert] = useState<Expert | null>(null);
  const [sortBy, setSortBy] = useState("Highest Rated");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const voxCoinsBalance = 250;
  const connectionCost = 50;

  // Filter states
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedSessionTypes, setSelectedSessionTypes] = useState<string[]>([]);
  const [selectedSessionFormats, setSelectedSessionFormats] = useState<string[]>([]);
  const [selectedSessionDurations, setSelectedSessionDurations] = useState<string[]>([]);
  const [selectedAudienceTypes, setSelectedAudienceTypes] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>([]);
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [customExpertise, setCustomExpertise] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [customSessionType, setCustomSessionType] = useState("");
  const [customAudienceType, setCustomAudienceType] = useState("");
  const [customLanguage, setCustomLanguage] = useState("");

  // Collapsible sections
  const [isRoleOpen, setIsRoleOpen] = useState(true);
  const [isExpertiseOpen, setIsExpertiseOpen] = useState(true);
  const [isIndustryOpen, setIsIndustryOpen] = useState(false);
  const [isSessionTypeOpen, setIsSessionTypeOpen] = useState(true);
  const [isSessionFormatOpen, setIsSessionFormatOpen] = useState(false);
  const [isSessionDurationOpen, setIsSessionDurationOpen] = useState(false);
  const [isAudienceTypeOpen, setIsAudienceTypeOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isExperienceLevelOpen, setIsExperienceLevelOpen] = useState(false);
  const [isVerificationStatusOpen, setIsVerificationStatusOpen] = useState(false);
  const [isPriceRangeOpen, setIsPriceRangeOpen] = useState(false);

  // Clear all filters function
  const clearAllFilters = () => {
    setSelectedRoles([]);
    setSelectedExpertise([]);
    setSelectedIndustries([]);
    setSelectedSessionTypes([]);
    setSelectedSessionFormats([]);
    setSelectedSessionDurations([]);
    setSelectedAudienceTypes([]);
    setSelectedLanguages([]);
    setSelectedAvailability([]);
    setSelectedRatings([]);
    setSelectedExperienceLevels([]);
    setSelectedVerificationStatus([]);
    setPriceMin("");
    setPriceMax("");
    setCustomExpertise("");
    setCustomIndustry("");
    setCustomSessionType("");
    setCustomAudienceType("");
    setCustomLanguage("");
  };

  // Build filter params for API
  const filterParams = {
    roles: selectedRoles.length > 0 ? selectedRoles.map((r) => r.toLowerCase()) : undefined,
    industries: selectedIndustries.length > 0 ? selectedIndustries : undefined,
    expertise: selectedExpertise.length > 0 ? selectedExpertise : undefined,
    sessionTypes: selectedSessionTypes.length > 0 ? selectedSessionTypes : undefined,
    sessionFormats: selectedSessionFormats.length > 0 ? selectedSessionFormats : undefined,
    sessionDurations: selectedSessionDurations.length > 0 ? selectedSessionDurations : undefined,
    audienceTypes: selectedAudienceTypes.length > 0 ? selectedAudienceTypes : undefined,
    languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
    availability: selectedAvailability.length > 0 ? selectedAvailability : undefined,
    ratings: selectedRatings.length > 0 ? selectedRatings : undefined,
    experienceLevels: selectedExperienceLevels.length > 0 ? selectedExperienceLevels : undefined,
    verificationStatus: selectedVerificationStatus.length > 0 ? selectedVerificationStatus : undefined,
    priceMin: priceMin ? parseFloat(priceMin) : undefined,
    priceMax: priceMax ? parseFloat(priceMax) : undefined,
    limit: 50,
  };

  // Fetch experts from API
  const {
    data: expertsData,
    isLoading,
    isError,
    error,
  } = useGetExpertsQuery(filterParams);

  const expertsRaw = expertsData?.data?.experts || [];
  
  // Sort experts based on selected sort option
  const experts = [...expertsRaw].sort((a, b) => {
    // Helper function to extract numeric price value
    const getPriceValue = (rate: string): number => {
      if (!rate || rate === "Price on request") return Infinity;
      const match = rate.match(/[\d,]+/);
      if (!match) return Infinity;
      return parseFloat(match[0].replace(/,/g, "")) || Infinity;
    };

    if (sortBy === "Highest Rated") {
      return (b.rating || 0) - (a.rating || 0);
    } else if (sortBy === "Lowest Price") {
      return getPriceValue(a.rate) - getPriceValue(b.rate);
    } else if (sortBy === "Highest Price") {
      return getPriceValue(b.rate) - getPriceValue(a.rate);
    } else if (sortBy === "Most Sessions") {
      return (b.sessions || 0) - (a.sessions || 0);
    }
    return 0;
  });

  const handleConnect = (expert: Expert) => {
    setSelectedExpert(expert);
    setIsConnectModalOpen(true);
  };

  const handleSendMessage = (expert: Expert) => {
    setMessageExpert(expert);
    setIsMessageModalOpen(true);
  };

  const handleConnectConfirm = () => {
    // TODO: Implement connection logic
    console.log("Connecting with", selectedExpert?.name);
    setIsConnectModalOpen(false);
    // Redirect to expert profile page
    if (selectedExpert) {
      router.push(`/marketplace/${selectedExpert.id}`);
    }
    setSelectedExpert(null);
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleExpertise = (expertise: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(expertise)
        ? prev.filter((e) => e !== expertise)
        : [...prev, expertise]
    );
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const toggleSessionType = (type: string) => {
    setSelectedSessionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const addCustomExpertise = () => {
    if (customExpertise.trim()) {
      setSelectedExpertise((prev) => [...prev, customExpertise.trim()]);
      setCustomExpertise("");
    }
  };

  const addCustomIndustry = () => {
    if (customIndustry.trim()) {
      setSelectedIndustries((prev) => [...prev, customIndustry.trim()]);
      setCustomIndustry("");
    }
  };

  const addCustomSessionType = () => {
    if (customSessionType.trim()) {
      setSelectedSessionTypes((prev) => [...prev, customSessionType.trim()]);
      setCustomSessionType("");
    }
  };

  const toggleSessionFormat = (format: string) => {
    setSelectedSessionFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const toggleSessionDuration = (duration: string) => {
    setSelectedSessionDurations((prev) =>
      prev.includes(duration) ? prev.filter((d) => d !== duration) : [...prev, duration]
    );
  };

  const toggleAudienceType = (type: string) => {
    setSelectedAudienceTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]
    );
  };

  const toggleAvailability = (availability: string) => {
    setSelectedAvailability((prev) =>
      prev.includes(availability) ? prev.filter((a) => a !== availability) : [...prev, availability]
    );
  };

  const toggleRating = (rating: string) => {
    setSelectedRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  const toggleExperienceLevel = (level: string) => {
    setSelectedExperienceLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const toggleVerificationStatus = (status: string) => {
    setSelectedVerificationStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const addCustomAudienceType = () => {
    if (customAudienceType.trim()) {
      setSelectedAudienceTypes((prev) => [...prev, customAudienceType.trim()]);
      setCustomAudienceType("");
    }
  };

  const addCustomLanguage = () => {
    if (customLanguage.trim()) {
      setSelectedLanguages((prev) => [...prev, customLanguage.trim()]);
      setCustomLanguage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Home Page Header */}
      <Header />

      {/* Marketplace Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
          {/* Top Row: Back Button, Title, VoxCoins Buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go to home"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Expert Marketplace</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Connect with verified experts across industries.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Sort Dropdown - Moved to left of VoxCoins */}
              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-blue-500 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-50 transition-colors min-w-[150px] justify-between"
                >
                  <span>{sortBy}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-600 transition-transform ${
                      isSortOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {isSortOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsSortOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <button
                        onClick={() => {
                          setSortBy("Highest Rated");
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          sortBy === "Highest Rated"
                            ? "bg-blue-500 text-white"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        Highest Rated
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("Lowest Price");
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          sortBy === "Lowest Price"
                            ? "bg-blue-500 text-white"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        Lowest Price
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("Highest Price");
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          sortBy === "Highest Price"
                            ? "bg-blue-500 text-white"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        Highest Price
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("Most Sessions");
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          sortBy === "Most Sessions"
                            ? "bg-blue-500 text-white"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        Most Sessions
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-gray-900 font-medium hover:bg-yellow-100 transition-colors">
                <span className="text-lg">V</span>
                <span>{voxCoinsBalance} VoxCoins</span>
              </button>
              <Link
                href="/payments"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Buy VoxCoins
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-80 shrink-0 bg-white rounded-lg border border-gray-200 p-4 h-[calc(100vh-8rem)] sticky top-24 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                title="Clear all filters"
              >
                <span className="text-lg leading-none">×</span>
                Clear All
              </button>
            </div>

            {/* Role Filter */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setIsRoleOpen(!isRoleOpen)}
                className="w-full flex items-center justify-between text-gray-900 font-medium mb-2"
              >
                <span>Role</span>
                {isRoleOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isRoleOpen && (
                <div className="space-y-2">
                  {["Speaker", "Trainer"].map(
                    (role) => (
                      <label
                        key={role}
                        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role)}
                          onChange={() => toggleRole(role)}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <span>{role}</span>
                      </label>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Primary Expertise Filter */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setIsExpertiseOpen(!isExpertiseOpen)}
                className="w-full flex items-center justify-between text-gray-900 font-medium mb-2"
              >
                <span>Primary Expertise</span>
                {isExpertiseOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isExpertiseOpen && (
                <div className="space-y-2">
                  {[
                    "Leadership",
                    "Sales",
                    "Marketing",
                    "Communication",
                    "AI / Tech",
                    "HR / L&D",
                    "Finance",
                    "Wellness",
                    "DEI",
                    "Entrepreneurship",
                    "Operations",
                    "Customer Success",
                    "Product Management",
                    "Public Speaking",
                  ].map((expertise) => (
                    <label
                      key={expertise}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedExpertise.includes(expertise)}
                        onChange={() => toggleExpertise(expertise)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="whitespace-nowrap">{expertise}</span>
                    </label>
                  ))}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <input
                      type="text"
                      placeholder="Add custom primary expertise"
                      value={customExpertise}
                      onChange={(e) => setCustomExpertise(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCustomExpertise()}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      onClick={addCustomExpertise}
                      className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Industry Experience Filter */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setIsIndustryOpen(!isIndustryOpen)}
                className="w-full flex items-center justify-between text-gray-900 font-medium mb-2"
              >
                <span>Industry Experience</span>
                {isIndustryOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isIndustryOpen && (
                <div className="space-y-2">
                  {[
                    "IT / SaaS",
                    "BFSI",
                    "Manufacturing",
                    "Healthcare",
                    "Education",
                    "Startups",
                    "Consulting",
                    "Government / PSU",
                    "E-commerce",
                    "Retail",
                    "Hospitality",
                    "Media & Entertainment",
                  ].map((industry) => (
                    <label
                      key={industry}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIndustries.includes(industry)}
                        onChange={() => toggleIndustry(industry)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="whitespace-nowrap">{industry}</span>
                    </label>
                  ))}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <input
                      type="text"
                      placeholder="Add custom industry experie"
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCustomIndustry()}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      onClick={addCustomIndustry}
                      className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Session Type Filter */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setIsSessionTypeOpen(!isSessionTypeOpen)}
                className="w-full flex items-center justify-between text-gray-900 font-medium mb-2"
              >
                <span>Session Type</span>
                {isSessionTypeOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isSessionTypeOpen && (
                <div className="space-y-2">
                  {[
                    "Keynote",
                    "Workshop",
                    "Training Program",
                    "Panel / Fireside Chat",
                    "Coaching / Mentoring",
                    "Webinar",
                    "Masterclass",
                  ].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSessionTypes.includes(type)}
                        onChange={() => toggleSessionType(type)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <input
                      type="text"
                      placeholder="Add custom session type..."
                      value={customSessionType}
                      onChange={(e) => setCustomSessionType(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCustomSessionType()}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      onClick={addCustomSessionType}
                      className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Session Format Filter */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setIsSessionFormatOpen(!isSessionFormatOpen)}
                className="w-full flex items-center justify-between text-gray-900 font-medium mb-2"
              >
                <span>Session Format</span>
                {isSessionFormatOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isSessionFormatOpen && (
                <div className="space-y-2">
                  {["Online", "Offline", "Hybrid"].map((format) => (
                    <label
                      key={format}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSessionFormats.includes(format)}
                        onChange={() => toggleSessionFormat(format)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span>{format}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Session Duration Filter */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setIsSessionDurationOpen(!isSessionDurationOpen)}
                className="w-full flex items-center justify-between text-gray-900 font-medium mb-2"
              >
                <span>Session Duration</span>
                {isSessionDurationOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isSessionDurationOpen && (
                <div className="space-y-2">
                  {[
                    "15-30 mins",
                    "30-60 mins",
                    "1-2 hours",
                    "Half day",
                    "Full day",
                    "Multi-day",
                  ].map((duration) => (
                    <label
                      key={duration}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSessionDurations.includes(duration)}
                        onChange={() => toggleSessionDuration(duration)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span>{duration}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Audience Type Filter */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setIsAudienceTypeOpen(!isAudienceTypeOpen)}
                className="w-full flex items-center justify-between text-gray-900 font-medium mb-2"
              >
                <span>Audience Type</span>
                {isAudienceTypeOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isAudienceTypeOpen && (
                <div className="space-y-2">
                  {[
                    "CXOs",
                    "Leadership Teams",
                    "Managers",
                    "Sales Teams",
                    "Marketing Teams",
                    "Technical Teams",
                    "HR Teams",
                    "Product Teams",
                    "Freshers",
                    "Founders",
                    "Students",
                    "Entrepreneurs",
                  ].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAudienceTypes.includes(type)}
                        onChange={() => toggleAudienceType(type)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <input
                      type="text"
                      placeholder="Add custom audience type..."
                      value={customAudienceType}
                      onChange={(e) => setCustomAudienceType(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCustomAudienceType()}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      onClick={addCustomAudienceType}
                      className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Languages Filter */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setIsLanguagesOpen(!isLanguagesOpen)}
                className="w-full flex items-center justify-between text-gray-900 font-medium mb-2"
              >
                <span>Languages</span>
                {isLanguagesOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isLanguagesOpen && (
                <div className="space-y-2">
                  {[
                    "English",
                    "Hindi",
                    "Spanish",
                    "Mandarin",
                    "Portuguese",
                    "French",
                    "German",
                    "Arabic",
                    "Japanese",
                    "Bengali",
                    "Tamil",
                    "Telugu",
                    "Marathi",
                    "Kannada",
                    "Malayalam",
                    "Gujarati",
                    "Punjabi",
                  ].map((language) => (
                    <label
                      key={language}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(language)}
                        onChange={() => toggleLanguage(language)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span>{language}</span>
                    </label>
                  ))}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <input
                      type="text"
                      placeholder="Add custom languages..."
                      value={customLanguage}
                      onChange={(e) => setCustomLanguage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCustomLanguage()}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      onClick={addCustomLanguage}
                      className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Availability Filter */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
                className="w-full flex items-center justify-between text-gray-900 font-medium mb-2"
              >
                <span>Availability</span>
                {isAvailabilityOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isAvailabilityOpen && (
                <div className="space-y-2">
                  {["Available This Week", "Available This Month"].map((availability) => (
                    <label
                      key={availability}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes(availability)}
                        onChange={() => toggleAvailability(availability)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span>{availability}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Rating Filter */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setIsRatingOpen(!isRatingOpen)}
                className="w-full flex items-center justify-between text-gray-900 font-medium mb-2"
              >
                <span>Rating</span>
                {isRatingOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isRatingOpen && (
                <div className="space-y-2">
                  {["1.0 Star", "2.0 Star", "3.0 Star", "4.0 Star", "5.0 Star and above"].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(rating)}
                        onChange={() => toggleRating(rating)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span>{rating}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Experience Level Filter */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setIsExperienceLevelOpen(!isExperienceLevelOpen)}
                className="w-full flex items-center justify-between text-gray-900 font-medium mb-2"
              >
                <span>Experience Level</span>
                {isExperienceLevelOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isExperienceLevelOpen && (
                <div className="space-y-2">
                  {[
                    "0-2 years",
                    "2-5 years",
                    "5-8 years",
                    "8-10 years",
                    "10-15 years",
                    "15-20 years",
                    "20+ years",
                  ].map((level) => (
                    <label
                      key={level}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedExperienceLevels.includes(level)}
                        onChange={() => toggleExperienceLevel(level)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span>{level}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Verification Status Filter */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setIsVerificationStatusOpen(!isVerificationStatusOpen)}
                className="w-full flex items-center justify-between text-gray-900 font-medium mb-2"
              >
                <span>Verification Status</span>
                {isVerificationStatusOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isVerificationStatusOpen && (
                <div className="space-y-2">
                  {["Platform Verified", "Credentials Verified"].map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVerificationStatus.includes(status)}
                        onChange={() => toggleVerificationStatus(status)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span>{status}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="mb-4">
              <button
                onClick={() => setIsPriceRangeOpen(!isPriceRangeOpen)}
                className="w-full flex items-center justify-between text-gray-900 font-medium mb-2"
              >
                <span>Price Range</span>
                {isPriceRangeOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {isPriceRangeOpen && (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <span className="text-gray-500 shrink-0">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Expert Cards */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600 font-medium">
                {experts.length} {experts.length === 1 ? "expert" : "experts"} found
              </p>
            </div>

            {/* Experts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            <span className="ml-3 text-gray-600">Loading experts...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-2">
                Failed to load experts. Please try again.
              </p>
              <p className="text-sm text-gray-500">
                {error && "data" in error
                  ? (error.data as any)?.message || "Unknown error"
                  : "Network error"}
              </p>
            </div>
          </div>
        ) : experts.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">No experts found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters
                </p>
          </div>
        ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experts.map((expert) => (
              <div
                key={expert.id}
                    className="p-6 bg-white border border-gray-200 rounded-lg hover:border-teal-500/50 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => router.push(`/marketplace/${expert.id}`)}
              >
                {/* Expert Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3">
                    <div className="h-14 w-14 bg-teal-600 text-white flex items-center justify-center rounded-full font-semibold shrink-0">
                      <span>{expert.initials}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-gray-900 font-semibold">{expert.name}</h3>
                        <Verified className="h-4 w-4 text-green-600 fill-current" />
                      </div>
                      {/* Industry */}
                      {expert.industry && (
                        <p className="text-xs text-gray-500 mt-0.5">{expert.industry}</p>
                      )}
                      {/* Role Badge */}
                      <div className="mt-1">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                            expert.role === "trainer"
                              ? "bg-blue-100 text-blue-700"
                              : expert.role === "speaker"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {expert.role === "trainer"
                            ? "Trainer"
                            : expert.role === "speaker"
                            ? "Speaker"
                            : expert.role}
                          </span>
                      </div>
                    </div>
                  </div>
                  {expert.isConnected && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded border border-green-300 shrink-0">
                      Connected
                    </span>
                  )}
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-gray-900 font-medium">{expert.rating}</span>
                    <span className="text-sm text-gray-600">({expert.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{expert.sessions} sessions</span>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                  {expert.description}
                </p>
                </div>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {expert.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Bottom Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-1 text-gray-600">
                    <span className="font-medium">{expert.rate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {expert.isConnected ? (
                      <button
                        className="bg-teal-600 text-white hover:bg-teal-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendMessage(expert);
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </button>
                    ) : (
                      <button
                        className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect(expert);
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Connect Expert Modal */}
      {selectedExpert && (
        <ConnectExpertModal
          isOpen={isConnectModalOpen}
          onClose={() => {
            setIsConnectModalOpen(false);
            setSelectedExpert(null);
          }}
          expert={selectedExpert}
          voxCoinsBalance={voxCoinsBalance}
          connectionCost={connectionCost}
          onConfirm={handleConnectConfirm}
        />
      )}

      {/* Send Message Modal */}
      {messageExpert && (
        <SendMessageModal
          isOpen={isMessageModalOpen}
          onClose={() => {
            setIsMessageModalOpen(false);
            setMessageExpert(null);
          }}
          expert={{
            id: messageExpert.id,
            name: messageExpert.name,
            initials: messageExpert.initials,
            title: messageExpert.title,
          }}
          onSend={(message) => {
            // TODO: Implement send message logic
            console.log("Sending message to", messageExpert.name, ":", message);
            setIsMessageModalOpen(false);
            setMessageExpert(null);
          }}
        />
      )}
    </div>
  );
}
