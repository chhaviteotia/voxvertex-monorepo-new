import express from "express";
import {
  createPostController,
  getUserPostsController,
  getPostByIdController,
  updatePostController,
  deletePostController,
  toggleLikePostController,
  addCommentController,
  toggleLikeCommentController,
  getUserPostStatsController,
  sharePostController,
} from "../controllers/postController.js";
import { authenticateUser } from "../../user/middleware/userAuth.js";
import { validateRequiredFields } from "../../middleware/validation.js";

const router = express.Router();

/**
 * Post Routes
 * All routes require authentication
 * Routes are prefixed with /api/posts
 */

/**
 * @route   GET /api/posts/stats
 * @desc    Get post statistics for current user
 * @access  Private
 */
router.get("/stats", authenticateUser, getUserPostStatsController);

/**
 * @route   GET /api/posts
 * @desc    Get all posts for current user (with filters)
 * @access  Private
 * @query   status, type, page, limit, search
 */
router.get("/", authenticateUser, getUserPostsController);

/**
 * @route   GET /api/posts/:postId
 * @desc    Get a single post by ID
 * @access  Private
 */
router.get("/:postId", authenticateUser, getPostByIdController);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 * @body    type, content, badge, badgeColor, hashtags, status, media
 */
router.post(
  "/",
  authenticateUser,
  validateRequiredFields(["content"]),
  createPostController
);

/**
 * @route   PUT /api/posts/:postId
 * @desc    Update a post
 * @access  Private
 * @body    content, type, badge, badgeColor, hashtags, status, media
 */
router.put("/:postId", authenticateUser, updatePostController);

/**
 * @route   DELETE /api/posts/:postId
 * @desc    Delete a post (soft delete)
 * @access  Private
 */
router.delete("/:postId", authenticateUser, deletePostController);

/**
 * @route   POST /api/posts/:postId/like
 * @desc    Like/Unlike a post
 * @access  Private
 */
router.post("/:postId/like", authenticateUser, toggleLikePostController);

/**
 * @route   POST /api/posts/:postId/share
 * @desc    Share a post
 * @access  Private
 */
router.post("/:postId/share", authenticateUser, sharePostController);

/**
 * @route   POST /api/posts/:postId/comments
 * @desc    Add a comment to a post
 * @access  Private
 * @body    content
 */
router.post(
  "/:postId/comments",
  authenticateUser,
  validateRequiredFields(["content"]),
  addCommentController
);

/**
 * @route   POST /api/posts/:postId/comments/:commentId/like
 * @desc    Like/Unlike a comment
 * @access  Private
 */
router.post(
  "/:postId/comments/:commentId/like",
  authenticateUser,
  toggleLikeCommentController
);

export default router;

