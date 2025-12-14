import express from "express";
import { 
  updateProfileController, 
  getProfileController, 
  updateBioController,
} from "../controllers/profileController.js";
import {
  getSpeakerProfileController,
  getTrainerProfileController,
  getOrganiserProfileController,
  updateSpeakerProfileController,
  updateTrainerProfileController,
  updateOrganiserProfileController,
  updateSpeakerBioController,
  updateOrganiserBioController,
} from "../controllers/roleSpecificControllers.js";
import {
  addAwardController,
  updateAwardController,
  deleteAwardController,
  addVideoController,
  updateVideoController,
  deleteVideoController,
  addExperienceController,
  updateExperienceController,
  deleteExperienceController,
  addEducationController,
  updateEducationController,
  deleteEducationController,
} from "../controllers/profileItemsController.js";
import { authenticateUser } from "../../user/middleware/userAuth.js";
import { validateRequiredFields } from "../../middleware/validation.js";

const router = express.Router();

/**
 * ============================================================================
 * PROFILE ROUTES - Role-Specific Endpoints
 * ============================================================================
 * 
 * ORGANISATION:
 * - Role-specific routes: /api/profile/{speaker|trainer|organiser}
 * - Shared routes: /api/profile/{experience|education|awards|videos} (used by all)
 * - Legacy routes: /api/profile/me, /api/profile/:userType (for backward compatibility)
 * 
 * USAGE BY ROLE:
 * - SPEAKER: Uses /api/profile/speaker/* endpoints
 * - TRAINER: Uses /api/profile/trainer/* endpoints (or /api/profile/expert for legacy)
 * - ORGANISER: Uses /api/profile/organiser/* endpoints
 * 
 * SHARED ENDPOINTS (used by all roles):
 * - Experience, Education, Awards, Videos CRUD operations
 * ============================================================================
 */

// ============================================================================
// SHARED ENDPOINTS - Used by Speaker, Trainer, and Organiser
// ============================================================================

/**
 * @route   POST /api/profile/experience
 * @desc    Add work experience (SHARED: speaker, trainer, organiser)
 * @access  Private
 */
router.post("/experience", authenticateUser, addExperienceController);

/**
 * @route   PUT /api/profile/experience/:experienceId
 * @desc    Update work experience (SHARED: speaker, trainer, organiser)
 * @access  Private
 */
router.put("/experience/:experienceId", authenticateUser, updateExperienceController);

/**
 * @route   DELETE /api/profile/experience/:experienceId
 * @desc    Delete work experience (SHARED: speaker, trainer, organiser)
 * @access  Private
 */
router.delete("/experience/:experienceId", authenticateUser, deleteExperienceController);

/**
 * @route   POST /api/profile/education
 * @desc    Add education (SHARED: speaker, trainer, organiser)
 * @access  Private
 */
router.post("/education", authenticateUser, addEducationController);

/**
 * @route   PUT /api/profile/education/:educationId
 * @desc    Update education (SHARED: speaker, trainer, organiser)
 * @access  Private
 */
router.put("/education/:educationId", authenticateUser, updateEducationController);

/**
 * @route   DELETE /api/profile/education/:educationId
 * @desc    Delete education (SHARED: speaker, trainer, organiser)
 * @access  Private
 */
router.delete("/education/:educationId", authenticateUser, deleteEducationController);

/**
 * @route   POST /api/profile/awards
 * @desc    Add award (SHARED: speaker, trainer, organiser)
 * @access  Private
 */
router.post("/awards", authenticateUser, addAwardController);

/**
 * @route   PUT /api/profile/awards/:awardId
 * @desc    Update award (SHARED: speaker, trainer, organiser)
 * @access  Private
 */
router.put("/awards/:awardId", authenticateUser, updateAwardController);

/**
 * @route   DELETE /api/profile/awards/:awardId
 * @desc    Delete award (SHARED: speaker, trainer, organiser)
 * @access  Private
 */
router.delete("/awards/:awardId", authenticateUser, deleteAwardController);

/**
 * @route   POST /api/profile/videos
 * @desc    Add featured video (SHARED: speaker, trainer, organiser)
 * @access  Private
 */
router.post("/videos", authenticateUser, addVideoController);

/**
 * @route   PUT /api/profile/videos/:videoId
 * @desc    Update featured video (SHARED: speaker, trainer, organiser)
 * @access  Private
 */
router.put("/videos/:videoId", authenticateUser, updateVideoController);

/**
 * @route   DELETE /api/profile/videos/:videoId
 * @desc    Delete featured video (SHARED: speaker, trainer, organiser)
 * @access  Private
 */
router.delete("/videos/:videoId", authenticateUser, deleteVideoController);

// ============================================================================
// SPEAKER-SPECIFIC ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/profile/speaker
 * @desc    Get speaker profile (SPEAKER ONLY)
 * @access  Private
 */
router.get("/speaker", authenticateUser, getSpeakerProfileController);

/**
 * @route   PUT /api/profile/speaker
 * @desc    Update speaker profile (SPEAKER ONLY)
 * @access  Private
 */
router.put("/speaker", authenticateUser, updateSpeakerProfileController);

/**
 * @route   PUT /api/profile/speaker/bio
 * @desc    Update speaker bio (SPEAKER ONLY)
 * @access  Private
 */
router.put("/speaker/bio", authenticateUser, updateSpeakerBioController);

// ============================================================================
// TRAINER-SPECIFIC ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/profile/trainer
 * @desc    Get trainer profile (TRAINER ONLY)
 * @access  Private
 * @note    Also available via /api/profile/expert (legacy endpoint)
 */
router.get("/trainer", authenticateUser, getTrainerProfileController);

/**
 * @route   PUT /api/profile/trainer
 * @desc    Update trainer profile (TRAINER ONLY)
 * @access  Private
 * @note    Also available via /api/profile/expert (legacy endpoint)
 */
router.put("/trainer", authenticateUser, updateTrainerProfileController);

// ============================================================================
// ORGANISER-SPECIFIC ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/profile/organiser
 * @desc    Get organiser profile (ORGANISER ONLY)
 * @access  Private
 */
router.get("/organiser", authenticateUser, getOrganiserProfileController);

/**
 * @route   PUT /api/profile/organiser/bio
 * @desc    Update organiser bio (ORGANISER ONLY)
 * @access  Private
 * @note    Must be defined before /organiser route to ensure correct matching
 */
router.put("/organiser/bio", authenticateUser, updateOrganiserBioController);

/**
 * @route   PUT /api/profile/organiser
 * @desc    Update organiser profile (ORGANISER ONLY)
 * @access  Private
 */
router.put("/organiser", authenticateUser, updateOrganiserProfileController);

// ============================================================================
// LEGACY/COMPATIBILITY ENDPOINTS (for backward compatibility)
// ============================================================================

/**
 * @route   GET /api/profile/me
 * @desc    Get current user's profile (LEGACY - works for all user types)
 * @access  Private
 * @deprecated Use role-specific endpoints: /api/profile/speaker, /api/profile/trainer, /api/profile/organiser
 */
router.get("/me", authenticateUser, getProfileController);

/**
 * @route   PUT /api/profile/bio
 * @desc    Update profile bio (LEGACY - for organiser/participant)
 * @access  Private
 * @deprecated Use /api/profile/organiser/bio or /api/profile/speaker/bio
 * @note    Must be before /:userType route to avoid route conflicts
 */
router.put("/bio", authenticateUser, updateBioController);

/**
 * @route   GET /api/profile/:userType
 * @desc    Get user profile (LEGACY - works for all user types)
 * @access  Private
 * @deprecated Use role-specific endpoints: /api/profile/speaker, /api/profile/trainer, /api/profile/organiser
 */
router.get("/:userType", authenticateUser, getProfileController);

/**
 * @route   PUT /api/profile/:userType
 * @desc    Update user profile (LEGACY - works for all user types)
 * @access  Private
 * @deprecated Use role-specific endpoints: /api/profile/speaker, /api/profile/trainer, /api/profile/organiser
 */
router.put("/:userType", authenticateUser, updateProfileController);

export default router;
