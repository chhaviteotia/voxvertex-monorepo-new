"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
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
  Verified,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useGetExpertByIdQuery } from "@/store/api/marketplaceApi";
import { toast } from "react-hot-toast";

type TabType = "Overview" | "Experience" | "Education" | "Reviews";

export default function SharedExpertProfilePage() {
  const router = useRouter();
  const params = useParams();
  const expertId = params?.id as string;
  const [activeTab, setActiveTab] = useState<TabType>("Overview");
  const [isFavorite, setIsFavorite] = useState(false);

  const { data, isLoading, error } = useGetExpertByIdQuery(expertId || "", {
    skip: !expertId,
  });

  // Check response structure - API returns { success: true, data: { expert: {...} } }
  // Match the same structure as marketplace/[id]/page.tsx
  const expert = data?.data?.expert || null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffbf5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !expert) {
    // Log error details for debugging
    if (error) {
      console.error("Error loading expert:", error);
    }
    if (data && !expert) {
      console.error("Expert data structure:", data);
    }
    
    return (
      <div className="min-h-screen bg-[#fffbf5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Profile not found</p>
          {expertId && (
            <p className="text-sm text-gray-500 mb-2">Expert ID: {expertId}</p>
          )}
          {error && 'data' in error && error.data && (
            <p className="text-sm text-gray-500 mb-2">
              {typeof error.data === 'string' ? error.data : error.data?.message || 'Unknown error'}
            </p>
          )}
          <a
            href="/"
            className="text-teal-600 hover:text-teal-700 underline"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* Simple Header - No Home Header */}
      <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="overflow-hidden" style={{ background: "transparent", lineHeight: 0 }}>
              <img
                src="/voxvertex-logo.jpeg"
                alt="VoxVertex Logo"
                className="h-12 w-auto object-contain block"
                style={{
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  display: "block",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-xl font-semibold text-teal-600">VV</span>';
                  }
                }}
              />
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Go to Home
          </Link>
        </div>
      </header>

      {/* Back to Marketplace Section */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* Profile Content - Reuse the same structure from marketplace/[id]/page.tsx */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-teal-600 flex items-center justify-center text-white text-4xl font-bold">
                {expert.name
                  ? expert.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "E"}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {expert.name}
                    </h1>
                    {expert.verified && (
                      <Verified className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                  <p className="text-lg text-gray-600 mb-2">{expert.title}</p>
                  {expert.industry && (
                    <p className="text-sm text-gray-500 mb-4">{expert.industry}</p>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900">
                      {expert.rating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {expert.reviews || 0} Reviews
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {expert.sessions || 0}
                  </div>
                  <p className="text-sm text-gray-600">Sessions</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {expert.rate || "Price on request"}
                  </div>
                  <p className="text-sm text-gray-600">Rate</p>
                </div>
              </div>

              {/* Description */}
              {expert.description && (
                <p className="text-gray-700 mb-4">{expert.description}</p>
              )}

              {/* Tags */}
              {expert.tags && expert.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {expert.tags.slice(0, 5).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-full border border-yellow-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-full p-1">
            {(["Overview", "Experience", "Education", "Reviews"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 rounded-full font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "Overview" && (
              <div className="space-y-6">
                {expert.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      About
                    </h3>
                    <p className="text-gray-700">{expert.description}</p>
                  </div>
                )}
                {expert.tags && expert.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {expert.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-full border border-yellow-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Experience" && (
              <div className="space-y-4">
                {expert.experienceList && expert.experienceList.length > 0 ? (
                  expert.experienceList.map((exp: any, index: number) => (
                    <div
                      key={index}
                      className="border-l-4 border-teal-500 pl-4 py-2 bg-amber-50 rounded-r-lg p-4 border border-amber-200"
                    >
                      <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.duration}</p>
                      {exp.description && (
                        <p className="text-gray-700 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No experience listed</p>
                )}
              </div>
            )}

            {activeTab === "Education" && (
              <div className="space-y-4">
                {expert.educationList && expert.educationList.length > 0 ? (
                  expert.educationList.map((edu: any, index: number) => (
                    <div
                      key={index}
                      className="bg-amber-50 rounded-lg p-4 border border-amber-200"
                    >
                      <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No education listed</p>
                )}
              </div>
            )}

            {activeTab === "Reviews" && (
              <div className="space-y-4">
                {expert.reviewsList && expert.reviewsList.length > 0 ? (
                  expert.reviewsList.map((review: any, index: number) => (
                    <div
                      key={index}
                      className="bg-amber-50 rounded-lg p-4 border border-amber-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold">
                            {review.reviewerInitials || "R"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.reviewerName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {review.reviewerTitle}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (review.rating || 0)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mt-2">{review.review}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No reviews yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

