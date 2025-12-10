import {
  createPost,
  getUserPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost,
  addComment,
  toggleLikeComment,
  incrementViews,
  getUserPostStats,
  sharePost,
} from "../services/post.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess, sendError, sendValidationError } from "../../utils/response.utils.js";

/**
 * Post Controller
 * Handles HTTP requests for post operations
 */

/**
 * Create a new post
 * POST /api/posts
 */
export const createPostController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { type, content, badge, badgeColor, hashtags, status, media } = req.body;

  if (!content || !content.trim()) {
    return sendValidationError(res, "Content is required");
  }

  try {
    const post = await createPost({
      author: userId,
      type: type || "article",
      content: content.trim(),
      badge,
      badgeColor,
      hashtags: Array.isArray(hashtags) ? hashtags : [],
      status: status || "published",
      media: media || {},
    });

    return sendSuccess(res, { post }, "Post created successfully", 201);
  } catch (error) {
    return sendError(res, error.message || "Failed to create post", 400);
  }
});

/**
 * Get all posts for the current user
 * GET /api/posts
 */
export const getUserPostsController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const {
    status = "published",
    type,
    page = 1,
    limit = 10,
    search,
    sortBy = "recent",
  } = req.query;

  try {
    const result = await getUserPosts(userId, {
      status,
      type,
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
    });

    return sendSuccess(res, result, "Posts retrieved successfully");
  } catch (error) {
    return sendError(res, error.message || "Failed to retrieve posts", 400);
  }
});

/**
 * Get a single post by ID
 * GET /api/posts/:postId
 */
export const getPostByIdController = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await getPostById(postId);
    
    // Increment views when post is viewed
    await incrementViews(postId);

    return sendSuccess(res, { post }, "Post retrieved successfully");
  } catch (error) {
    return sendError(res, error.message || "Post not found", 404);
  }
});

/**
 * Update a post
 * PUT /api/posts/:postId
 */
export const updatePostController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { postId } = req.params;
  const updateData = req.body;

  try {
    const post = await updatePost(postId, userId, updateData);
    return sendSuccess(res, { post }, "Post updated successfully");
  } catch (error) {
    return sendError(res, error.message || "Failed to update post", 400);
  }
});

/**
 * Delete a post
 * DELETE /api/posts/:postId
 */
export const deletePostController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { postId } = req.params;

  try {
    await deletePost(postId, userId);
    return sendSuccess(res, null, "Post deleted successfully");
  } catch (error) {
    return sendError(res, error.message || "Failed to delete post", 400);
  }
});

/**
 * Like/Unlike a post
 * POST /api/posts/:postId/like
 */
export const toggleLikePostController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { postId } = req.params;

  try {
    const post = await toggleLikePost(postId, userId);
    return sendSuccess(res, { post }, "Post like toggled successfully");
  } catch (error) {
    return sendError(res, error.message || "Failed to toggle like", 400);
  }
});

/**
 * Add a comment to a post
 * POST /api/posts/:postId/comments
 */
export const addCommentController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { postId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return sendValidationError(res, "Comment content is required");
  }

  try {
    const post = await addComment(postId, userId, content);
    return sendSuccess(res, { post }, "Comment added successfully", 201);
  } catch (error) {
    return sendError(res, error.message || "Failed to add comment", 400);
  }
});

/**
 * Like/Unlike a comment
 * POST /api/posts/:postId/comments/:commentId/like
 */
export const toggleLikeCommentController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { postId, commentId } = req.params;

  try {
    const post = await toggleLikeComment(postId, commentId, userId);
    return sendSuccess(res, { post }, "Comment like toggled successfully");
  } catch (error) {
    return sendError(res, error.message || "Failed to toggle comment like", 400);
  }
});

/**
 * Get post statistics for the current user
 * GET /api/posts/stats
 */
export const getUserPostStatsController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  try {
    const stats = await getUserPostStats(userId);
    return sendSuccess(res, { stats }, "Statistics retrieved successfully");
  } catch (error) {
    return sendError(res, error.message || "Failed to retrieve statistics", 400);
  }
});

/**
 * Share a post
 * POST /api/posts/:postId/share
 */
export const sharePostController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { postId } = req.params;

  try {
    const post = await sharePost(postId, userId);
    return sendSuccess(res, { post }, "Post shared successfully");
  } catch (error) {
    return sendError(res, error.message || "Failed to share post", 400);
  }
});

