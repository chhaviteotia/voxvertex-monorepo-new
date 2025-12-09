"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Heart,
  Eye,
  TrendingUp,
  ArrowRight,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  ArrowLeft,
} from "lucide-react";
import PostCreateInput from "./PostCreateInput";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";

interface PostsPageProps {
  user: any;
}

export default function PostsPage({ user }: PostsPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posts" | "drafts" | "all">(
    "posts"
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to get user initials
  const getUserInitials = (name?: string): string => {
    if (!name) return "TN";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get author info from user data
  const getAuthorInfo = () => {
    if (!user) {
      return {
        name: "User",
        role: "Expert",
        avatar: "U",
        verified: false,
      };
    }
    const name = user?.fullName || user?.name || "User";
    const role = user?.professionalTitle || user?.role || "Expert";
    const initials = getUserInitials(name);
    return {
      name,
      role,
      avatar: initials,
      verified: user?.verified || false,
    };
  };

  const authorInfo = getAuthorInfo();

  // Mock data - will be replaced with actual API calls
  const stats = {
    totalPosts: 8,
    totalLikes: 3388,
    totalViews: 45104,
    engagement: 4824,
  };

  const posts = [
    {
      id: "1",
      author: {
        ...authorInfo,
      },
      timestamp: "2 hours ago",
      badge: "Achievement",
      badgeColor: "green",
      content: `Just wrapped up a 3-day intensive leadership workshop with an amazing group of executives! 🎯

The key highlight? We explored how AI is reshaping leadership paradigms. The discussions were incredibly insightful, and I'm excited to see how these leaders will apply these learnings in their organizations.`,
      hashtags: ["#Leadership", "#AI", "#Workshop"],
      metrics: {
        views: 1234,
        likes: 127,
        comments: 2,
        shares: 15,
      },
      comments: [
        {
          id: "1",
          author: "Sameer Khan",
          timestamp: "18 hours ago",
          content:
            "Spot on! Point #3 is often overlooked. Vulnerability builds trust.",
          likes: 12,
        },
        {
          id: "2",
          author: "Priya Sharma",
          timestamp: "15 hours ago",
          content:
            "Great insights! The workshop sounds amazing. Would love to attend your next session.",
          likes: 8,
        },
      ],
    },
    {
      id: "2",
      author: {
        ...authorInfo,
      },
      timestamp: "1 day ago",
      badge: "Insight",
      badgeColor: "blue",
      content: `5 key learnings from my recent digital transformation consulting:

1. It's not about technology - it's about people
2. Change management is 80% communication
3. Leaders need to model vulnerability
4. Small wins create momentum
5. Culture eats strategy for breakfast

What's your take on digital transformation? Drop your thoughts below! 👋`,
      hashtags: ["#DigitalTransformation", "#Leadership", "#ChangeManagement"],
      metrics: {
        views: 3456,
        likes: 234,
        comments: 1,
        shares: 42,
      },
      comments: [
        {
          id: "1",
          author: "Sameer Khan",
          timestamp: "18 hours ago",
          content:
            "Spot on! Point #3 is often overlooked. Vulnerability builds trust.",
          likes: 12,
        },
      ],
    },
  ];

  const drafts: any[] = [];

  // All posts data (for "View All Posts" view)
  const allPosts = [
    ...posts,
    {
      id: "3",
      author: {
        ...authorInfo,
      },
      timestamp: "3 days ago",
      badge: "Event",
      badgeColor: "purple" as const,
      content: `Excited to announce my upcoming workshop on "AI-Driven Leadership" next month! Limited seats available.`,
      hashtags: ["#Event", "#Workshop", "#AI"],
      metrics: {
        views: 5678,
        likes: 456,
        comments: 32,
        shares: 89,
      },
      comments: [],
    },
    {
      id: "4",
      author: {
        ...authorInfo,
      },
      timestamp: "1 week ago",
      badge: "Article",
      badgeColor: "blue" as const,
      content: `Just published a new article on "The Future of Remote Leadership". Check it out and share your thoughts!`,
      hashtags: ["#Article", "#Leadership", "#RemoteWork"],
      metrics: {
        views: 8901,
        likes: 678,
        comments: 45,
        shares: 123,
      },
      comments: [],
    },
  ];

  const userInitials = getUserInitials(user?.fullName);

  // Show "View All Posts" view
  if (activeTab === "all") {
    return (
      <div className="min-h-screen bg-[#fffbf5]">
        <div className="w-full">
          {/* White Background Container for Header, Stats, and Search */}
          <div className="bg-white rounded-xl border-2 border-gray-300 p-6 mb-6 mx-6">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setActiveTab("posts")}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back to Profile</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium">
                  <Download className="w-4 h-4" />
                  Export Posts
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  All Posts
                </h1>
                <p className="text-gray-600">
                  Manage and view all your published content
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4 shadow-sm border-2 border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Total Posts
                  </span>
                  <FileText className="w-5 h-5 text-gray-900" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPosts}
                </p>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 shadow-sm border-2 border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Total Likes
                  </span>
                  <Heart className="w-5 h-5 text-gray-900" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalLikes.toLocaleString()}
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 shadow-sm border-2 border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Total Views
                  </span>
                  <Eye className="w-5 h-5 text-gray-900" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 shadow-sm border-2 border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Engagement
                  </span>
                  <TrendingUp className="w-5 h-5 text-gray-900" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.engagement.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search posts by content or tags..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700">
                  <Filter className="w-4 h-4" />
                  All Types
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700">
                  <ArrowUpDown className="w-4 h-4" />
                  Most Recent
                </button>
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-6 mb-8">
            {allPosts
              .filter((post) =>
                searchTerm
                  ? post.content
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    post.hashtags.some((tag) =>
                      tag.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                  : true
              )
              .map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserAvatar={userInitials}
                  currentUserName={authorInfo.name}
                />
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* Main Content - Full width after sidebar, no max-width constraint */}
      <div className="w-full">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mx-6">
          <div className="bg-teal-600 rounded-xl p-4 shadow-sm border-2 border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                Total Posts
              </span>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalPosts}</p>
          </div>

          <div className="bg-orange-600 rounded-xl p-4 shadow-sm border-2 border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                Total Likes
              </span>
              <Heart className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.totalLikes.toLocaleString()}
            </p>
          </div>

          <div className="bg-purple-500 rounded-xl p-4 shadow-sm border-2 border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                Total Views
              </span>
              <Eye className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.totalViews.toLocaleString()}
            </p>
          </div>

          <div className="bg-teal-600 rounded-xl p-4 shadow-sm border-2 border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Engagement</span>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.engagement}</p>
          </div>
        </div>

        {/* Post Container with very light yellow background */}
        <div className="bg-[#fffef9] rounded-xl p-6 mx-6">
          {/* Post Creation Input */}
          <PostCreateInput
            userInitials={userInitials}
            onClick={() => setIsCreateModalOpen(true)}
          />

          {/* Create Post Modal */}
          <CreatePostModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onPublish={(data) => {
              console.log("Publishing post:", data);
              // TODO: Implement actual post creation API call
              setIsCreateModalOpen(false);
            }}
          />

          {/* Tabs and View All Button */}
          <div className="flex items-center justify-between mb-6 mt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-4 py-2 rounded-xl font-medium transition-colors border-2 ${
                  activeTab === "posts"
                    ? "bg-teal-600 text-white border-gray-300"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              >
                My Posts ({activeTab === "posts" ? posts.length : 0})
              </button>
              <button
                onClick={() => setActiveTab("drafts")}
                className={`px-4 py-2 rounded-xl font-medium transition-colors border-2 ${
                  activeTab === "drafts"
                    ? "bg-teal-600 text-white border-gray-300"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              >
                Drafts ({drafts.length})
              </button>
            </div>
            <button
              onClick={() => {
                // Toggle to show all posts view
                setActiveTab("all");
              }}
              className="flex items-center gap-2 px-4 py-2 border-2 border-teal-600 text-teal-600 rounded-xl hover:bg-teal-50 transition-colors font-medium"
            >
              View All Posts
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {activeTab === "posts" ? (
              posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserAvatar={userInitials}
                    currentUserName={authorInfo.name}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No posts yet. Create your first post!
                </div>
              )
            ) : drafts.length > 0 ? (
              drafts.map((draft) => (
                <PostCard
                  key={draft.id}
                  post={draft}
                  currentUserAvatar={userInitials}
                  currentUserName={authorInfo.name}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <FileText className="w-24 h-24 text-gray-300 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No drafts yet
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  Start creating a post and save it as a draft to continue
                  later.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
