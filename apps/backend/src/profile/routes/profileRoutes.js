import express from "express";
import { updateProfileController, getProfileController } from "../controllers/profileController.js";
import { authenticateUser } from "../../user/middleware/userAuth.js";
import { validateRequiredFields } from "../../middleware/validation.js";

const router = express.Router();

/**
 * Profile Routes
 * Handles profile-related operations for all user types
 * Routes are prefixed with /api/profile/:userType
 */

/**
 * @route   GET /api/profile/:userType
 * @desc    Get user profile
 * @access  Private
 */
router.get("/:userType", authenticateUser, getProfileController);

/**
 * @route   PUT /api/profile/:userType
 * @desc    Update user profile
 * @access  Private
 */
router.put("/:userType", authenticateUser, updateProfileController);

export default router;

