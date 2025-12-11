"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Languages,
  TrendingUp,
  User,
  Building2,
  Award,
  Star,
  Briefcase,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import SendMessageModal from "./components/SendMessageModal";
import { useGetExpertByIdQuery } from "@/store/api/marketplaceApi";

interface Expert {
  id: string;
  name: string;
  initials: string;
  title: string;
  rating: number;
  reviews: number;
  sessions: number;
  description: string;
  tags: string[];
  rate: string;
  location: string;
  responseTime: string;
  languages: string[];
  experience: string;
  availability: "Available" | "Limited" | "Busy";
  isConnected: boolean;
  experienceList?: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
  educationList?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  reviewsList?: Array<{
    reviewerName: string;
    reviewerInitials: string;
    reviewerTitle: string;
    rating: number;
    review: string;
  }>;
}

type TabType = "Overview" | "Experience" | "Education" | "Reviews";

export default function ExpertProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("Overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [expertId, setExpertId] = useState<string | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setExpertId(resolvedParams.id);
    });
  }, [params]);

  // Fetch expert from API
  const {
    data: expertData,
    isLoading,
    isError,
    error,
  } = useGetExpertByIdQuery(expertId || "", {
    skip: !expertId,
  });

  const expert = expertData?.data?.expert || null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expert profile...</p>
        </div>
      </div>
    );
  }

  if (isError || (!isLoading && !expert)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Expert not found
          </h1>
          <Link
            href="/marketplace"
            className="text-teal-600 hover:text-teal-700"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const tabs: TabType[] = ["Overview", "Experience", "Education", "Reviews"];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return "bg-gray-100 text-gray-700";
      case "Limited":
        return "bg-yellow-50 text-yellow-700";
      case "Busy":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/marketplace"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Marketplace</span>
            </Link>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Share Profile</span>
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite
                    ? "text-red-500"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-2xl font-semibold">
                  {expert.initials}
                </div>
              </div>

              {/* Name and Title */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {expert.name}
                  </h2>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <p className="text-sm text-gray-600">{expert.title}</p>
                {expert.isConnected && (
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    Connected
                  </span>
                )}
              </div>

              {/* Statistics */}
              <div className="flex items-center justify-center gap-6 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-red-500 fill-red-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {expert.rating} Rating
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {expert.reviews} Reviews
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {expert.sessions} Sessions
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setIsMessageModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </button>
                <button className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                  <Calendar className="w-4 h-4" />
                  Book Session
                </button>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span>{expert.rate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{expert.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>Responds within 2 hours</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Languages className="w-4 h-4 text-gray-500" />
                  <span>
                    {expert.languages && expert.languages.length > 0
                      ? expert.languages.join(", ")
                      : "Not specified"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span>{expert.experience}</span>
                </div>
              </div>

              {/* Availability */}
              <div className="text-center">
                <span
                  className={`inline-block px-4 py-2 text-xs font-medium rounded-full ${getAvailabilityColor(
                    expert.availability
                  )}`}
                >
                  {expert.availability}
                </span>
              </div>
            </div>
          </div>

          {/* Right Content - Profile Details */}
          <div className="lg:col-span-2">
            <div>
              {/* Tabs */}
              <div className="px-6 pt-4">
                <nav
                  className="flex bg-gray-200 rounded-full p-1"
                  aria-label="Tabs"
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 whitespace-nowrap py-2 px-4 font-medium text-sm transition-colors text-center ${
                        activeTab === tab
                          ? "bg-white text-gray-900 rounded-full shadow-sm"
                          : "text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "Overview" && (
                  <div className="space-y-4">
                    {/* About */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircle className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">About</h3>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {expert.description}
                      </p>
                    </div>

                    {/* Expertise Areas */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">
                          Expertise Areas
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {expert.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills & Competencies */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">
                          Skills & Competencies
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {expert.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    {expert.certifications &&
                      expert.certifications.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">
                              Certifications
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {expert.certifications.map((cert, index) => (
                              <div
                                key={index}
                                className="bg-yellow-50 rounded-lg p-4 border border-gray-200"
                              >
                                <div className="flex items-start gap-3">
                                  <Award className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {cert.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {cert.issuer || cert.institute}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {cert.year}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {activeTab === "Experience" && (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                      <Briefcase className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        Professional Experience
                      </h3>
                    </div>
                    {expert.experienceList &&
                    expert.experienceList.length > 0 ? (
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                        <div className="space-y-6">
                          {expert.experienceList.map((exp, index) => (
                            <div
                              key={index}
                              className="relative flex items-start"
                            >
                              {/* Timeline marker */}
                              <div className="absolute left-3 w-3 h-3 rounded-full bg-teal-500 border-2 border-white z-10"></div>
                              <div className="ml-8 flex-1 bg-gray-100 rounded-lg p-4">
                                <p className="font-medium text-gray-900">
                                  {exp.role}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {exp.company}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {exp.duration}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-2">
                                  {exp.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No experience information available.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "Education" && (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                      <BookOpen className="w-5 h-5 text-teal-600" />
                      <h3 className="font-semibold text-gray-900">
                        Educational Background
                      </h3>
                    </div>
                    {expert.educationList && expert.educationList.length > 0 ? (
                      <div className="space-y-4">
                        {expert.educationList.map((edu, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 rounded-lg p-4"
                          >
                            <div className="flex items-start gap-3">
                              <BookOpen className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {edu.degree}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {edu.institution}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {edu.year}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No education information available.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "Reviews" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                        <h3 className="font-semibold text-gray-900">
                          Client Reviews
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(expert.rating)
                                  ? "text-orange-500 fill-orange-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-700">
                          {expert.rating} ({expert.reviews} reviews)
                        </span>
                      </div>
                    </div>
                    {expert.reviewsList && expert.reviewsList.length > 0 ? (
                      <div className="space-y-4">
                        {expert.reviewsList.map((review, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                                {review.reviewerInitials}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {review.reviewerName}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {review.reviewerTitle}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < review.rating
                                          ? "text-orange-500 fill-orange-500"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">
                              {review.review}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No reviews available yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send Message Modal */}
      <SendMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        expert={{
          id: expert.id,
          name: expert.name,
          initials: expert.initials,
          title: expert.title,
        }}
        onSend={(message) => {
          // TODO: Implement send message logic
          console.log("Sending message to", expert.name, ":", message);
        }}
      />
    </div>
  );
}
