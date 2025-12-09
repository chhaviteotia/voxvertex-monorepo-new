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
} from "lucide-react";
import Link from "next/link";
import SendMessageModal from "./components/SendMessageModal";

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

// Mock data - in real app, this would come from API based on ID
const getExpertById = (id: string): Expert | null => {
  const experts: Expert[] = [
    {
      id: "1",
      name: "Dr. Priya Sharma",
      initials: "PS",
      title: "Mindfulness Trainer & Wellness Expert",
      rating: 5,
      reviews: 215,
      sessions: 680,
      description:
        "Clinical psychologist and certified mindfulness instructor. Pioneering corporate wellness programs for global organizations.",
      tags: ["Mindfulness", "Stress Management", "Corporate Wellness"],
      rate: "$200/hr",
      location: "London, UK",
      responseTime: "Responds within 1 hour",
      languages: ["English", "Hindi"],
      experience: "15+ years experience",
      availability: "Available",
      isConnected: true,
      certifications: [
        {
          name: "Certified Mindfulness Instructor",
          issuer: "Mindfulness Institute",
          year: "2010",
        },
      ],
    },
    {
      id: "2",
      name: "Sarah Johnson",
      initials: "SJ",
      title: "Leadership Coach & Mentor",
      rating: 4.9,
      reviews: 127,
      sessions: 450,
      description:
        "15+ years of experience coaching Fortune 500 executives and high-growth startups. Specializing in transformational leadership and organizational culture.",
      tags: ["Leadership", "Team Building", "Executive Coaching"],
      rate: "$250/hr",
      location: "New York, USA",
      responseTime: "Responds within 1 hour",
      languages: ["English", "Spanish"],
      experience: "15+ years experience",
      availability: "Available",
      isConnected: true,
    },
    {
      id: "3",
      name: "Elena Volkov",
      initials: "EV",
      title: "Product Management Expert",
      rating: 4.9,
      reviews: 156,
      sessions: 420,
      description:
        "Led product teams at Google and startups. Passionate about building products that users love and businesses need.",
      tags: ["Product Strategy", "Agile", "User Experience"],
      rate: "$280/hr",
      location: "Berlin, Germany",
      responseTime: "Responds within 3 hours",
      languages: ["English", "German", "Russian"],
      experience: "15+ years experience",
      availability: "Limited",
      isConnected: true,
      experienceList: [
        {
          role: "Product Manager",
          company: "Google",
          duration: "2005-2015",
          description: "Led product teams in developing innovative solutions.",
        },
        {
          role: "Product Strategist",
          company: "Startups",
          duration: "2015-2020",
          description: "Developed product strategies for startups.",
        },
      ],
      educationList: [
        {
          degree: "MBA",
          institution: "Stanford University",
          year: "2005",
        },
        {
          degree: "BSc",
          institution: "Technical University of Munich",
          year: "2001",
        },
      ],
      certifications: [
        {
          name: "Certified Product Manager",
          issuer: "Product Institute",
          year: "2010",
        },
      ],
      reviewsList: [
        {
          reviewerName: "Charlie White",
          reviewerInitials: "CW",
          reviewerTitle: "Product Manager at Product Inc",
          rating: 5,
          review:
            "Elena is a great strategist who helped improve our product management.",
        },
      ],
    },
  ];

  return experts.find((e) => e.id === id) || null;
};

type TabType = "Overview" | "Experience" | "Education" | "Reviews";

export default function ExpertProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("Overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [expertId, setExpertId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setExpertId(resolvedParams.id);
      setIsLoading(false);
    });
  }, [params]);

  const expert = expertId ? getExpertById(expertId) : null;

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

  if (!expert) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#f5f5f0]">
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
              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-red-500 fill-red-500" />
                    <span className="text-sm font-semibold text-gray-900">
                      {expert.rating}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {expert.reviews}
                  </p>
                  <p className="text-xs text-gray-600">Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {expert.sessions}
                  </p>
                  <p className="text-xs text-gray-600">Sessions</p>
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
                  <span>{expert.responseTime}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Languages className="w-4 h-4 text-gray-500" />
                  <span>{expert.languages.join(", ")}</span>
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
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              {/* Tabs */}
              <div className="border-b border-gray-200 px-6 pt-4 bg-gray-50">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab
                          ? "border-teal-600 text-teal-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
                        <User className="w-5 h-5 text-gray-600" />
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
                        <User className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">
                          Skills & Competencies
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {expert.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
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
                            <User className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">
                              Certifications
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {expert.certifications.map((cert, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                              >
                                <div className="flex items-start gap-3">
                                  <User className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
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
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Building2 className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        Professional Experience
                      </h3>
                    </div>
                    {expert.experienceList &&
                    expert.experienceList.length > 0 ? (
                      <div className="space-y-4">
                        {expert.experienceList.map((exp, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-start gap-3">
                              <Building2 className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {exp.role}
                                </p>
                                <p className="text-sm text-gray-600">
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
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No experience information available.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "Education" && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Award className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        Educational Background
                      </h3>
                    </div>
                    {expert.educationList && expert.educationList.length > 0 ? (
                      <div className="space-y-4">
                        {expert.educationList.map((edu, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-start gap-3">
                              <Award className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
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
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
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
