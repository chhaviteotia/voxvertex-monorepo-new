"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Share2,
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
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import UserDropdown from "@/components/UserDropdown";
import SendMessageModal from "./components/SendMessageModal";
import { useGetExpertByIdQuery } from "@/store/api/marketplaceApi";
import {
  useFindOrCreateConversationMutation,
  useSendMessageMutation,
} from "@/store/api/messagesApi";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";
import { toast } from "react-hot-toast";

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
  const router = useRouter();
  const { user: authUser, isAuthenticated, logout: authLogout } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();
  const [activeTab, setActiveTab] = useState<TabType>("Overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [expertId, setExpertId] = useState<string | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [findOrCreateConversation, { isLoading: isCreatingConversation }] =
    useFindOrCreateConversationMutation();
  const [sendMessage, { isLoading: isSendingMessage }] = useSendMessageMutation();

  // Get user details for display
  const displayUser = authUser || currentUserData?.user;
  const userName = displayUser?.fullName || displayUser?.firstName || displayUser?.email?.split("@")[0] || "User";
  // Only show as logged in if both auth state and user data are present
  const isUserLoggedIn = isAuthenticated && !!displayUser;

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

  // Check if the logged-in user is viewing their own profile
  const currentUserId = displayUser?._id || displayUser?.id;
  const expertUserId = expert?.id;
  const isOwnProfile = currentUserId && expertUserId && String(currentUserId) === String(expertUserId);

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

  const handleBack = () => {
    router.push("/marketplace");
  };

  const handleLogout = async () => {
    // Use unified logout for all user types
    await authLogout();
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!isAuthenticated || !expert) {
      toast.error("Please log in to send a message");
      router.push("/login");
      return;
    }

    try {
      // Step 1: Find or create conversation
      const conversationResult = await findOrCreateConversation({
        participantId: expert.id,
      }).unwrap();

      const conversationId =
        conversationResult.data?.conversation?._id ||
        conversationResult.data?.conversation?.id;

      if (!conversationId) {
        toast.error("Failed to create conversation");
        return;
      }

      // Step 2: Send the message
      await sendMessage({
        conversationId,
        data: {
          content: messageContent,
        },
      }).unwrap();

      toast.success("Message sent successfully!");
      setIsMessageModalOpen(false);
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error(error?.data?.message || "Failed to send message. Please try again.");
    }
  };

  const handleBookSession = () => {
    // TODO: Implement book session logic
    console.log("Booking session with", expert.name);
    toast.info("Booking session feature coming soon!");
  };

  const handleShareProfile = async () => {
    try {
      if (!expertId) {
        toast.error("Profile ID not available");
        return;
      }

      // Generate shareable link
      const shareableLink = `${window.location.origin}/marketplace/${expertId}/share`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareableLink);
      
      // Show success message
      toast.success(`Profile link copied to clipboard!`);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* Header - Same as Home Page */}
      <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 py-5 gap-4">
          {/* Logo and Company Name */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div
              className="overflow-hidden"
              style={{ background: "transparent", lineHeight: 0 }}
            >
              <img
                src="/voxvertex-logo.png"
                alt="VoxVertex Logo"
                className="h-15 w-auto object-contain block"
                style={{
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  display: "block",
                }}
              />
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden flex-1 items-center justify-center md:flex min-w-0" style={{ maxWidth: "380px" }}>
            <div className="relative w-full" style={{ maxWidth: "360px" }}>
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search experts..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Navigation Links - Between Search and Buttons */}
          <nav
            className="hidden items-center gap-4 xl:gap-6 lg:flex shrink-0"
          >
            <Link
              href="/community"
              className="px-2 xl:px-4 text-sm xl:text-base font-medium text-gray-700 transition-colors hover:text-teal-600 whitespace-nowrap"
            >
              Community
            </Link>
            <Link
              href="/marketplace"
              className="px-2 xl:px-4 text-sm xl:text-base font-medium text-gray-700 transition-colors hover:text-teal-600 whitespace-nowrap"
            >
              Marketplace
            </Link>
            <Link
              href="#"
              className="px-2 xl:px-4 text-sm xl:text-base font-medium text-gray-700 transition-colors hover:text-teal-600 whitespace-nowrap"
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="px-2 xl:px-4 text-sm xl:text-base font-medium text-gray-700 transition-colors hover:text-teal-600 whitespace-nowrap"
            >
              About
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">
            {!isAuthenticated && (
              <>
                <Link
                  href="/signup/organiser"
                  className="hidden rounded-lg bg-teal-500 px-3 xl:px-5 py-2 xl:py-2.5 text-xs xl:text-sm font-medium text-white transition-colors hover:bg-teal-600 lg:block whitespace-nowrap"
                >
                  Find Experts
                </Link>
                <Link
                  href="/signup/expert"
                  className="hidden rounded-lg border-2 border-teal-500 bg-white px-3 xl:px-5 py-2 xl:py-2.5 text-xs xl:text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50 lg:block whitespace-nowrap"
                >
                  Join as Expert
                </Link>
              </>
            )}
            {isUserLoggedIn ? (
              <UserDropdown userName={userName} onLogout={handleLogout} />
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-orange-500 px-3 xl:px-5 py-2 xl:py-2.5 text-xs xl:text-sm font-medium text-white transition-colors hover:bg-orange-600 whitespace-nowrap"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="border-t border-gray-200 px-4 py-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search experts..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>
      </header>

      {/* Back to Marketplace and Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-4 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-teal-600" />
            <span className="font-medium text-sm text-teal-600">Back to Marketplace</span>
          </button>

          {/* Share and Favorite Buttons */}
          <div className="flex items-center gap-3">
            {/* Share Profile Button */}
            <button
              onClick={handleShareProfile}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#EDE9E4] border border-gray-300 hover:bg-[#E8E3DC] transition-colors"
              aria-label="Share Profile"
            >
              <Share2 className="w-5 h-5 text-gray-800" />
              <span className="font-medium text-sm text-gray-800">Share Profile</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2.5 rounded-lg bg-[#EDE9E4] border border-gray-300 hover:bg-[#E8E3DC] transition-colors"
              aria-label="Add to favorites"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-800"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Expert Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-24">
              <div className="text-center mb-6">
                <div className="h-32 w-32 bg-teal-600 text-white flex items-center justify-center rounded-full mx-auto mb-4">
                  <span className="text-4xl font-semibold">{expert.initials}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{expert.name}</h2>
                  <Verified className="h-5 w-5 text-teal-600 fill-current" />
                </div>
                <p className="text-sm text-gray-600 mb-4">{expert.title}</p>
                
                {expert.isConnected ? (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200 mb-4">
                    Connected
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200 mb-4">
                    Not Connected
                  </span>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-gray-900 font-medium">{expert.rating}</span>
                    </div>
                    <p className="text-xs text-gray-600">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-900 font-medium mb-1">{expert.reviews}</p>
                    <p className="text-xs text-gray-600">Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-900 font-medium mb-1">{expert.sessions}</p>
                    <p className="text-xs text-gray-600">Sessions</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Only show if not viewing own profile */}
              {!isOwnProfile && (
                <div className="space-y-3">
                  <button
                    onClick={() => setIsMessageModalOpen(true)}
                    disabled={isCreatingConversation || isSendingMessage}
                    className="w-full bg-teal-600 text-white hover:bg-teal-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Send Message
                  </button>
                  <button
                    onClick={handleBookSession}
                    className="w-full bg-orange-500 text-white hover:bg-orange-600 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Book Session
                  </button>
                </div>
              )}

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-900">{expert.rate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-900">{expert.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-900">Responds {expert.responseTime?.toLowerCase() || "within 2 hours"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Languages className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-900">
                    {expert.languages && expert.languages.length > 0
                      ? expert.languages.join(", ")
                      : "Not specified"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-900">{expert.experience}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Tabs */}
              <div className="grid grid-cols-4 bg-[#EDE9E4] rounded-full p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap py-2 px-4 font-medium text-sm transition-all text-center ${
                      activeTab === tab
                        ? "bg-white text-[#2C2826] shadow-sm rounded-full"
                        : "text-[#6B6662] hover:text-[#2C2826] rounded-full"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === "Overview" && (
                  <div className="space-y-6">
                    {/* About */}
                    <div className="bg-white rounded-lg p-6 border border-[#DED9D3]">
                      <h3 className="text-[#2C2826] mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-[#4A9B8E]" />
                        About
                      </h3>
                      <p className="text-[#6B6662] leading-relaxed">{expert.description}</p>
                    </div>

                    {/* Expertise */}
                    <div className="bg-white rounded-lg p-6 border border-[#DED9D3]">
                      <h3 className="text-[#2C2826] mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-[#4A9B8E]" />
                        Expertise Areas
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {expert.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-[#4A9B8E]/20 text-[#4A9B8E] text-xs font-medium rounded-full border border-[#4A9B8E]/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-white rounded-lg p-6 border border-[#DED9D3]">
                      <h3 className="text-[#2C2826] mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-[#4A9B8E]" />
                        Skills & Competencies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {expert.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-[#EDE9E4] text-[#6B6662] text-xs font-medium rounded-full border border-[#DED9D3]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    {expert.certifications && expert.certifications.length > 0 && (
                      <div className="bg-white rounded-lg p-6 border border-[#DED9D3]">
                        <h3 className="text-[#2C2826] mb-4 flex items-center gap-2">
                          <Award className="h-5 w-5 text-[#4A9B8E]" />
                          Certifications
                        </h3>
                        <div className="space-y-4">
                          {expert.certifications.map((cert, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-[#EDE9E4] rounded-lg">
                              <div className="w-10 h-10 bg-[#4A9B8E]/10 rounded flex items-center justify-center flex-shrink-0">
                                <Award className="h-5 w-5 text-[#4A9B8E]" />
                              </div>
                              <div>
                                <h4 className="text-[#2C2826] mb-1 font-medium">{cert.name}</h4>
                                <p className="text-sm text-[#6B6662]">{cert.issuer || cert.institute}</p>
                                <p className="text-xs text-[#6B6662] mt-1">{cert.year}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "Experience" && (
                  <div className="bg-white rounded-lg p-6 border border-[#DED9D3]">
                    <h3 className="text-[#2C2826] mb-6 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-[#4A9B8E]" />
                      Professional Experience
                    </h3>
                    {expert.experienceList && expert.experienceList.length > 0 ? (
                      <div className="space-y-6">
                        {expert.experienceList.map((exp, index) => (
                          <div key={index} className="relative pl-6 pb-6 border-l-2 border-[#DED9D3] last:border-l-0 last:pb-0">
                            <div className="absolute -left-2 top-0 w-4 h-4 bg-[#4A9B8E] rounded-full border-2 border-[#F8F6F3]"></div>
                            <div className="bg-[#EDE9E4] p-4 rounded-lg">
                              <h4 className="text-[#2C2826] mb-1 font-medium">{exp.role}</h4>
                              <p className="text-sm text-[#6B6662] mb-2">{exp.company}</p>
                              <p className="text-xs text-[#6B6662] mb-3 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {exp.duration}
                              </p>
                              <p className="text-sm text-[#6B6662]">{exp.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#6B6662]">No experience information available.</p>
                    )}
                  </div>
                )}

                {activeTab === "Education" && (
                  <div className="bg-white rounded-lg p-6 border border-[#DED9D3]">
                    <h3 className="text-[#2C2826] mb-6 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-[#4A9B8E]" />
                      Educational Background
                    </h3>
                    {expert.educationList && expert.educationList.length > 0 ? (
                      <div className="space-y-4">
                        {expert.educationList.map((edu, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-[#EDE9E4] rounded-lg">
                            <div className="w-12 h-12 bg-[#4A9B8E]/10 rounded flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-6 w-6 text-[#4A9B8E]" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-[#2C2826] mb-1 font-medium">{edu.degree}</h4>
                              <p className="text-sm text-[#6B6662] mb-1">{edu.institution}</p>
                              <p className="text-xs text-[#6B6662]">{edu.year}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#6B6662]">No education information available.</p>
                    )}
                  </div>
                )}

                {activeTab === "Reviews" && (
                  <div className="bg-white rounded-lg p-6 border border-[#DED9D3]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[#2C2826] flex items-center gap-2">
                        <Star className="h-5 w-5 text-[#D97757] fill-current" />
                        Client Reviews
                      </h3>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-[#D97757] fill-current" />
                        <span className="text-[#2C2826] font-medium">{expert.rating}</span>
                        <span className="text-sm text-[#6B6662]">({expert.reviews} reviews)</span>
                      </div>
                    </div>
                    {expert.reviewsList && expert.reviewsList.length > 0 ? (
                      <div className="space-y-4">
                        {expert.reviewsList.map((review, index) => (
                          <div key={index} className="p-4 bg-[#EDE9E4] rounded-lg">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 bg-[#4A9B8E] text-white flex items-center justify-center rounded-full">
                                <span className="text-sm font-semibold">{review.reviewerInitials}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-[#2C2826] font-medium">{review.reviewerName}</h4>
                                <p className="text-sm text-[#6B6662]">{review.reviewerTitle}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-[#D97757] fill-current"
                                        : "text-[#DED9D3]"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-[#6B6662]">{review.review}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#6B6662]">No reviews available yet.</p>
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
        onSend={handleSendMessage}
      />
    </div>
  );
}
