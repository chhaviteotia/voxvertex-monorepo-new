"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  ChevronDown,
  Image,
  Video,
  Trophy,
  Lightbulb,
  Calendar,
} from "lucide-react";
import PostCreateInput from "./PostCreateInput";
import PostCard from "./PostCard";
import DraftCard from "./DraftCard";
import CreatePostModal from "./CreatePostModal";
import {
  useGetPostStatsQuery,
  useGetUserPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  type Post,
} from "@/store/api/postsApi";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import { formatRelativeTime } from "@/utils/timeUtils";

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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedPostType, setSelectedPostType] = useState<string | null>(null);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [sortOrder, setSortOrder] = useState<
    "recent" | "oldest" | "mostLiked" | "mostViewed" | "mostEngaged"
  >("recent");
  const [showSortFilter, setShowSortFilter] = useState(false);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  // API calls
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetPostStatsQuery();
  const {
    data: publishedPostsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useGetUserPostsQuery({ status: "published" });
  const {
    data: draftPostsData,
    isLoading: draftsLoading,
    refetch: refetchDrafts,
  } = useGetUserPostsQuery({ status: "draft" });
  const { data: allPostsData, isLoading: allPostsLoading } =
    useGetUserPostsQuery({
      status: "published",
      limit: 50,
      type: selectedPostType || undefined,
      search: debouncedSearchTerm || undefined,
      sortBy: sortOrder,
    });
  const [createPost, { isLoading: isCreatingPost }] = useCreatePostMutation();
  const [updatePost] = useUpdatePostMutation();
  const [deletePost] = useDeletePostMutation();
  const [editingDraft, setEditingDraft] = useState<any>(null);

  // Map post type to badge
  const getBadgeFromType = (
    type: string
  ): { badge: string; badgeColor: "green" | "blue" | "orange" | "purple" } => {
    const badgeMap: Record<
      string,
      { badge: string; badgeColor: "green" | "blue" | "orange" | "purple" }
    > = {
      article: { badge: "Article", badgeColor: "blue" },
      image: { badge: "Image", badgeColor: "orange" },
      video: { badge: "Video", badgeColor: "purple" },
      celebrate: { badge: "Celebrate", badgeColor: "green" },
      insight: { badge: "Insight", badgeColor: "orange" },
      event: { badge: "Event", badgeColor: "purple" },
    };
    return badgeMap[type] || { badge: "Post", badgeColor: "green" };
  };

  // Transform API data to component format
  const transformPost = (apiPost: Post) => {
    const authorInitials = getUserInitials(apiPost.author.fullName);
    const badgeInfo = apiPost.badge
      ? { badge: apiPost.badge, badgeColor: apiPost.badgeColor }
      : getBadgeFromType(apiPost.type);

    return {
      id: apiPost._id,
      author: {
        name: apiPost.author.fullName,
        role: apiPost.author.professionalTitle || apiPost.author.role,
        avatar: authorInitials,
        verified: apiPost.author.verified || false,
        _id: apiPost.author._id,
      },
      timestamp: apiPost.createdAt
        ? formatRelativeTime(apiPost.createdAt)
        : apiPost.formattedTimestamp || "recently",
      createdAt: apiPost.createdAt || new Date().toISOString(),
      badge: badgeInfo.badge,
      badgeColor: badgeInfo.badgeColor,
      content: apiPost.content,
      hashtags: apiPost.hashtags,
      metrics: apiPost.metrics,
      likedBy: apiPost.likedBy || [],
      comments: apiPost.comments.map((comment) => ({
        id: comment._id,
        author: comment.author.fullName,
        timestamp: new Date(comment.createdAt).toLocaleString(),
        content: comment.content,
        likes: comment.likes,
      })),
    };
  };

  const stats = statsData?.data?.stats || {
    totalPosts: 0,
    totalLikes: 0,
    totalViews: 0,
    engagement: 0,
  };

  const posts = useMemo(
    () => publishedPostsData?.data?.posts?.map(transformPost) || [],
    [publishedPostsData]
  );

  const drafts = useMemo(
    () => draftPostsData?.data?.posts?.map(transformPost) || [],
    [draftPostsData]
  );

  const allPosts = useMemo(
    () => allPostsData?.data?.posts?.map(transformPost) || [],
    [allPostsData]
  );

  // Post type options matching CreatePostModal
  const postTypeOptions = [
    {
      id: "article",
      label: "Article",
      icon: FileText,
      color: "text-green-600",
    },
    { id: "image", label: "Image", icon: Image, color: "text-orange-600" },
    { id: "video", label: "Video", icon: Video, color: "text-purple-600" },
    {
      id: "celebrate",
      label: "Celebrate",
      icon: Trophy,
      color: "text-teal-600",
    },
    {
      id: "insight",
      label: "Insight",
      icon: Lightbulb,
      color: "text-orange-600",
    },
    { id: "event", label: "Event", icon: Calendar, color: "text-purple-600" },
  ];

  // Posts are already filtered and sorted by backend based on searchTerm, selectedPostType, and sortOrder
  // No need for additional client-side filtering since API handles it
  const filteredAllPosts = useMemo(() => {
    return allPosts;
  }, [allPosts]);

  const selectedTypeLabel = selectedPostType
    ? postTypeOptions.find((opt) => opt.id === selectedPostType)?.label ||
      "All Types"
    : "All Types";

  const sortOptions = [
    { id: "recent", label: "Most Recent" },
    { id: "oldest", label: "Oldest First" },
    { id: "mostLiked", label: "Most Liked" },
    { id: "mostViewed", label: "Most Viewed" },
    { id: "mostEngaged", label: "Most Engaged" },
  ];

  const selectedSortLabel =
    sortOptions.find((opt) => opt.id === sortOrder)?.label || "Most Recent";

  const handleCreatePost = async (data: {
    type: string;
    content: string;
    tags: string;
  }) => {
    try {
      const hashtags = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      await createPost({
        type: data.type as any,
        content: data.content,
        hashtags,
        status: "published",
      }).unwrap();

      setIsCreateModalOpen(false);
      refetchPosts();
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const handleSaveDraft = async (data: {
    type: string;
    content: string;
    tags: string;
  }) => {
    try {
      const hashtags = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      if (editingDraft) {
        // Update existing draft
        await updatePost({
          postId: editingDraft.id,
          data: {
            type: data.type as any,
            content: data.content,
            hashtags,
            status: "draft",
          },
        }).unwrap();
        setEditingDraft(null);
      } else {
        // Create new draft
        await createPost({
          type: data.type as any,
          content: data.content,
          hashtags,
          status: "draft",
        }).unwrap();
      }

      setIsCreateModalOpen(false);
      // Refetch drafts to show the updated/newly saved draft
      refetchDrafts();
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  const handlePublishDraft = async (draftId: string) => {
    try {
      const draft = drafts.find((d) => d.id === draftId);
      if (!draft) return;

      await updatePost({
        postId: draftId,
        data: {
          status: "published",
        },
      }).unwrap();

      // Refetch both posts and drafts
      refetchPosts();
      refetchDrafts();
      refetchStats();
    } catch (error) {
      console.error("Failed to publish draft:", error);
    }
  };

  const handleEditDraft = (draft: any) => {
    // Find the full draft data from the API
    const fullDraft = draftPostsData?.data?.posts?.find(
      (p: any) => p._id === draft.id
    );
    setEditingDraft({
      ...draft,
      type: fullDraft?.type || draft.type || "article",
    });
    setIsCreateModalOpen(true);
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;

    try {
      await deletePost(draftId).unwrap();
      refetchDrafts();
    } catch (error) {
      console.error("Failed to delete draft:", error);
    }
  };

  const handleExportPosts = () => {
    // Get the filtered posts to export
    const postsToExport =
      filteredAllPosts.length > 0 ? filteredAllPosts : allPosts;

    if (postsToExport.length === 0) {
      alert("No posts to export");
      return;
    }

    // Prepare CSV data
    const headers = [
      "Title",
      "Type",
      "Content",
      "Hashtags",
      "Likes",
      "Views",
      "Comments",
      "Shares",
      "Created At",
    ];
    const rows = postsToExport.map((post) => {
      const content = post.content.replace(/\n/g, " ").replace(/,/g, ";"); // Replace commas and newlines
      const hashtags = post.hashtags.join("; ");
      const createdAt = post.createdAt
        ? new Date(post.createdAt).toLocaleString()
        : post.timestamp;

      return [
        post.badge || "Post",
        post.badge || "article",
        content,
        hashtags,
        post.metrics.likes.toString(),
        post.metrics.views.toString(),
        post.metrics.comments.toString(),
        post.metrics.shares.toString(),
        createdAt,
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `posts_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

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
                <button
                  onClick={handleExportPosts}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                >
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
            {statsLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading stats...
              </div>
            ) : (
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
            )}

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
              <div className="flex items-center gap-2 relative">
                {/* All Types Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowTypeFilter(!showTypeFilter)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
                  >
                    <Filter className="w-4 h-4" />
                    {selectedTypeLabel}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {showTypeFilter && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowTypeFilter(false)}
                      />
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-20 overflow-hidden">
                        <button
                          onClick={() => {
                            setSelectedPostType(null);
                            setShowTypeFilter(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                            !selectedPostType
                              ? "bg-teal-50 text-teal-700 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          <Filter className="w-4 h-4" />
                          <span>All Types</span>
                        </button>
                        {postTypeOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.id}
                              onClick={() => {
                                setSelectedPostType(option.id);
                                setShowTypeFilter(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                                selectedPostType === option.id
                                  ? "bg-teal-50 text-teal-700 font-medium"
                                  : "text-gray-700"
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${option.color}`} />
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortFilter(!showSortFilter)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    {selectedSortLabel}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Sort Dropdown Menu */}
                  {showSortFilter && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowSortFilter(false)}
                      />
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-20 overflow-hidden">
                        {sortOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSortOrder(
                                option.id as
                                  | "recent"
                                  | "oldest"
                                  | "mostLiked"
                                  | "mostViewed"
                                  | "mostEngaged"
                              );
                              setShowSortFilter(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                              sortOrder === option.id
                                ? "bg-teal-50 text-teal-700 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          {allPostsLoading ? (
            <div className="text-center py-12 text-gray-500 mx-6">
              Loading posts...
            </div>
          ) : filteredAllPosts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-6 mb-8">
              {filteredAllPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserAvatar={userInitials}
                  currentUserName={authorInfo.name}
                  onLikeToggle={refetchStats}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 mx-6">
              No posts found
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* Main Content - Full width after sidebar, no max-width constraint */}
      <div className="w-full">
        {/* Statistics Cards */}
        {statsLoading ? (
          <div className="text-center py-8 text-gray-500 mx-6">
            Loading stats...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mx-6">
            <div className="bg-teal-600 rounded-xl p-4 shadow-sm border-2 border-gray-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">
                  Total Posts
                </span>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.totalPosts}
              </p>
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
                <span className="text-sm font-medium text-white">
                  Engagement
                </span>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.engagement}
              </p>
            </div>
          </div>
        )}

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
            onClose={() => {
              setIsCreateModalOpen(false);
              setEditingDraft(null);
            }}
            onPublish={handleCreatePost}
            onSaveDraft={handleSaveDraft}
            editingDraft={editingDraft}
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
                My Posts ({posts.length})
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
              postsLoading ? (
                <div className="text-center py-12 text-gray-500">
                  Loading posts...
                </div>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserAvatar={userInitials}
                    currentUserName={authorInfo.name}
                    onLikeToggle={refetchStats}
                    onDelete={refetchPosts}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No posts yet. Create your first post!
                </div>
              )
            ) : draftsLoading ? (
              <div className="text-center py-12 text-gray-500">
                Loading drafts...
              </div>
            ) : drafts.length > 0 ? (
              <div className="space-y-4">
                {(draftPostsData?.data?.posts || []).map((draft: any) => (
                  <DraftCard
                    key={draft._id}
                    draft={{
                      id: draft._id,
                      type: draft.type || "article",
                      content: draft.content || "",
                      hashtags: draft.hashtags || [],
                      createdAt: draft.createdAt,
                      updatedAt: draft.updatedAt || draft.createdAt,
                    }}
                    onPublish={handlePublishDraft}
                    onEdit={handleEditDraft}
                    onDelete={handleDeleteDraft}
                  />
                ))}
              </div>
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
