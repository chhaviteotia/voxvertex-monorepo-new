import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendError } from "../../utils/response.utils.js";
import { getUserByEmail, updateUserProfile, getOrCreateProfile } from "../services/profile.service.js";
import {
  getProfileController,
  updateProfileController,
} from "./profileController.js";

/**
 * ============================================================================
 * ROLE-SPECIFIC PROFILE CONTROLLERS
 * ============================================================================
 * 
 * These controllers validate user roles before allowing access to endpoints.
 * They wrap the generic controllers with role-based authorization.
 * 
 * USAGE:
 * - Speaker endpoints: Only accessible to users with role "speaker"
 * - Trainer endpoints: Only accessible to users with role "trainer"
 * - Organiser endpoints: Only accessible to users with role "organiser" or "organizer"
 * 
 * All controllers return 403 Forbidden if the wrong role tries to access them.
 * ============================================================================
 */

// ============================================================================
// SPEAKER-SPECIFIC CONTROLLERS
// ============================================================================

/**
 * Get Speaker Profile
 * GET /api/profile/speaker
 * SPEAKER ONLY - Validates user role before proceeding
 */
export const getSpeakerProfileController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  // Validate user is a speaker
  if (user.role !== "speaker") {
    return sendError(
      res,
      "This endpoint is only accessible to speakers",
      403
    );
  }

  // Use the generic getProfileController logic
  return getProfileController(req, res);
});

/**
 * Update Speaker Profile
 * PUT /api/profile/speaker
 * SPEAKER ONLY - Validates user role before proceeding
 */
export const updateSpeakerProfileController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  // Validate user is a speaker
  if (user.role !== "speaker") {
    return sendError(
      res,
      "This endpoint is only accessible to speakers",
      403
    );
  }

  // Use the generic updateProfileController logic
  return updateProfileController(req, res);
});

/**
 * Update Speaker Bio
 * PUT /api/profile/speaker/bio
 * SPEAKER ONLY - Validates user role before proceeding
 */
export const updateSpeakerBioController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  // Validate user is a speaker
  if (user.role !== "speaker") {
    return sendError(
      res,
      "This endpoint is only accessible to speakers",
      403
    );
  }

  const { bio } = req.body;

  if (bio === undefined) {
    return sendError(res, "Bio is required", 400);
  }

  // Update user profile with bio
  const { user: updatedUser } = await updateUserProfile(req.user.email, { bio });

  // Refresh profile to get latest data
  const refreshedProfile = await getOrCreateProfile(updatedUser._id);

  // Map experience to match frontend expectations
  const mappedExperience = (refreshedProfile.experience || []).map((exp) => ({
    _id: exp._id,
    title: exp.title,
    organization: exp.company || exp.organization,
    start: exp.startDate || exp.start,
    end: exp.endDate || exp.end,
    description: exp.description,
    location: exp.location,
    type: exp.type,
    skills: exp.skills || [],
    achievements: exp.achievements || [],
  }));

  // Map education to match frontend expectations
  const mappedEducation = (refreshedProfile.education || []).map((edu) => ({
    _id: edu._id,
    degree: edu.degree,
    institution: edu.institution,
    field: edu.fieldOfStudy || edu.field,
    start: edu.year || edu.start,
    end: edu.end || null,
    grade: edu.grade || null,
    location: edu.location || null,
    activities: edu.activities || [],
    description: edu.description || null,
  }));

  // Calculate ratings from reviews
  const reviews = refreshedProfile.reviews || [];
  let ratings = refreshedProfile.ratings || { overall: { average: 0, count: 0 } };
  
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = totalRating / reviews.length;
    ratings = {
      overall: {
        average: averageRating,
        count: reviews.length,
      },
    };
    }

    // Return response with merged user and profile data (same structure as getProfile)
    res.status(200).json({
      success: true,
      message: "Bio updated successfully",
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        firstName: updatedUser.firstName || null,
        lastName: updatedUser.lastName || null,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber || updatedUser.mobileNo || null,
        mobileNo: updatedUser.mobileNo || updatedUser.phoneNumber || null,
        phone: updatedUser.phoneNumber || updatedUser.mobileNo || null,
        role: updatedUser.role,
        // Profile fields (from Profile model)
        professionalTitle: refreshedProfile.professionalTitle || null,
        yearsOfExperience: refreshedProfile.yearsOfExperience || null,
        timeZone: refreshedProfile.timeZone || null,
        profileImageUrl: refreshedProfile.profileImageUrl || null,
        // Location fields (from User model)
        city: updatedUser.city || null,
        country: updatedUser.country || null,
        location: updatedUser.city && updatedUser.country ? `${updatedUser.city}, ${updatedUser.country}` : (updatedUser.city || updatedUser.country || null),
        industry: updatedUser.industry || null,
        // Other fields
        emailVerified: updatedUser.emailVerified,
        phoneVerified: updatedUser.phoneVerified,
        registrationCompleted: updatedUser.registrationCompleted,
        // Bio/About field (from Profile model)
        bio: refreshedProfile.bio || null,
        // Contact info fields (from Profile model)
        website: refreshedProfile.website || null,
        linkedin: refreshedProfile.linkedin || null,
        twitter: refreshedProfile.twitter || null,
        // Experience array (mapped to match frontend)
        experience: mappedExperience,
        // Education array (mapped to match frontend)
        education: mappedEducation,
        // Awards array (from Profile model)
        awards: refreshedProfile.awards || [],
        // Featured videos array (from Profile model)
        featuredVideos: refreshedProfile.featuredVideos || [],
        // Reviews array (from Profile model)
        reviews: reviews,
        // Ratings (calculated from reviews)
        ratings: ratings,
        // Certifications array (from Profile model)
        certifications: refreshedProfile.certifications || [],
        // Training categories array (from Profile model)
        trainingCategories: refreshedProfile.trainingCategories || [],
        // Languages array (from Profile model)
        languages: refreshedProfile.languages || [],
        // Industries served array (from Profile model)
        industriesServed: refreshedProfile.industriesServed || [],
        // Client types served array (from Profile model)
        clientTypesServed: refreshedProfile.clientTypesServed || [],
        // Work preferences (from Profile model)
        workPreferences: refreshedProfile.workPreferences || {
          workArrangements: [],
          sessionDurations: [],
          geographicPreference: [],
          travelWillingness: [],
          travelDetails: "",
        },
        // Skills assessment (from Profile model)
        skillsAssessment: refreshedProfile.skillsAssessment || [],
        // Training calendar (from Profile model)
        trainingCalendar: refreshedProfile.trainingCalendar || [],
        // Area of expertise (for organiser/speaker)
        areaOfExpertise: refreshedProfile.areaOfExpertise || [],
      },
    });
});

// ============================================================================
// TRAINER-SPECIFIC CONTROLLERS
// ============================================================================

/**
 * Get Trainer Profile
 * GET /api/profile/trainer
 * TRAINER ONLY - Validates user role before proceeding
 */
export const getTrainerProfileController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  // Validate user is a trainer
  if (user.role !== "trainer") {
    return sendError(
      res,
      "This endpoint is only accessible to trainers",
      403
    );
  }

  // Use the generic getProfileController logic
  return getProfileController(req, res);
});

/**
 * Update Trainer Profile
 * PUT /api/profile/trainer
 * TRAINER ONLY - Validates user role before proceeding
 */
export const updateTrainerProfileController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  // Validate user is a trainer
  if (user.role !== "trainer") {
    return sendError(
      res,
      "This endpoint is only accessible to trainers",
      403
    );
  }

  // Use the generic updateProfileController logic
  return updateProfileController(req, res);
});

// ============================================================================
// ORGANISER-SPECIFIC CONTROLLERS
// ============================================================================

/**
 * Get Organiser Profile
 * GET /api/profile/organiser
 * ORGANISER ONLY - Validates user role before proceeding
 */
export const getOrganiserProfileController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  // Validate user is an organiser (check both spellings)
  if (user.role !== "organiser" && user.role !== "organizer") {
    return sendError(
      res,
      "This endpoint is only accessible to organisers",
      403
    );
  }

  // Use the generic getProfileController logic
  return getProfileController(req, res);
});

/**
 * Update Organiser Profile
 * PUT /api/profile/organiser
 * ORGANISER ONLY - Validates user role before proceeding
 */
export const updateOrganiserProfileController = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      return sendError(res, "Not authenticated", 401);
    }

    const user = await getUserByEmail(req.user.email);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Validate user is an organiser (check both spellings)
    if (user.role !== "organiser" && user.role !== "organizer") {
      return sendError(
        res,
        "This endpoint is only accessible to organisers",
        403
      );
    }

    // Use the generic updateProfileController logic
    return updateProfileController(req, res);
  }
);

/**
 * Update Organiser Bio
 * PUT /api/profile/organiser/bio
 * ORGANISER ONLY - Validates user role before proceeding
 */
export const updateOrganiserBioController = asyncHandler(async (req, res) => {
  try {
    console.log("🔵 updateOrganiserBioController - Request received");
    console.log("🔵 User from req.user:", req.user?.email);
    console.log("🔵 Request body:", req.body);

    if (!req.user) {
      console.error("❌ No user in request");
      return sendError(res, "Not authenticated", 401);
    }

    const user = await getUserByEmail(req.user.email);
    if (!user) {
      console.error("❌ User not found:", req.user.email);
      return sendError(res, "User not found", 404);
    }

    console.log("🔵 User role:", user.role);

    // Validate user is an organiser (check both spellings)
    if (user.role !== "organiser" && user.role !== "organizer") {
      console.error("❌ User is not an organiser. Role:", user.role);
      return sendError(
        res,
        "This endpoint is only accessible to organisers",
        403
      );
    }

    const { bio } = req.body;

    if (bio === undefined) {
      console.error("❌ Bio is undefined in request body");
      return sendError(res, "Bio is required", 400);
    }

    console.log("🔵 Updating bio:", bio?.substring(0, 50) + "...");

    // Update user profile with bio
    const { user: updatedUser } = await updateUserProfile(req.user.email, { bio });
    
    console.log("✅ Bio updated successfully");

    // Refresh profile to get latest data
    const refreshedProfile = await getOrCreateProfile(updatedUser._id);

    // Map experience to match frontend expectations
    const mappedExperience = (refreshedProfile.experience || []).map((exp) => ({
      _id: exp._id,
      title: exp.title,
      organization: exp.company || exp.organization,
      start: exp.startDate || exp.start,
      end: exp.endDate || exp.end,
      description: exp.description,
      location: exp.location,
      type: exp.type,
      skills: exp.skills || [],
      achievements: exp.achievements || [],
    }));

    // Map education to match frontend expectations
    const mappedEducation = (refreshedProfile.education || []).map((edu) => ({
      _id: edu._id,
      degree: edu.degree,
      institution: edu.institution,
      field: edu.fieldOfStudy || edu.field,
      start: edu.year || edu.start,
      end: edu.end || null,
      grade: edu.grade || null,
      location: edu.location || null,
      activities: edu.activities || [],
      description: edu.description || null,
    }));

    // Calculate ratings from reviews
    const reviews = refreshedProfile.reviews || [];
    let ratings = refreshedProfile.ratings || { overall: { average: 0, count: 0 } };
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      const averageRating = totalRating / reviews.length;
      ratings = {
        overall: {
          average: averageRating,
          count: reviews.length,
        },
      };
    }

    // Return response with merged user and profile data (same structure as getProfile)
    res.status(200).json({
      success: true,
      message: "Bio updated successfully",
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        firstName: updatedUser.firstName || null,
        lastName: updatedUser.lastName || null,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber || updatedUser.mobileNo || null,
        mobileNo: updatedUser.mobileNo || updatedUser.phoneNumber || null,
        phone: updatedUser.phoneNumber || updatedUser.mobileNo || null,
        role: updatedUser.role,
        // Profile fields (from Profile model)
        professionalTitle: refreshedProfile.professionalTitle || null,
        yearsOfExperience: refreshedProfile.yearsOfExperience || null,
        timeZone: refreshedProfile.timeZone || null,
        profileImageUrl: refreshedProfile.profileImageUrl || null,
        // Location fields (from User model)
        city: updatedUser.city || null,
        country: updatedUser.country || null,
        location: updatedUser.city && updatedUser.country ? `${updatedUser.city}, ${updatedUser.country}` : (updatedUser.city || updatedUser.country || null),
        industry: updatedUser.industry || null,
        // Other fields
        emailVerified: updatedUser.emailVerified,
        phoneVerified: updatedUser.phoneVerified,
        registrationCompleted: updatedUser.registrationCompleted,
        // Bio/About field (from Profile model)
        bio: refreshedProfile.bio || null,
        // Contact info fields (from Profile model)
        website: refreshedProfile.website || null,
        linkedin: refreshedProfile.linkedin || null,
        twitter: refreshedProfile.twitter || null,
        // Experience array (mapped to match frontend)
        experience: mappedExperience,
        // Education array (mapped to match frontend)
        education: mappedEducation,
        // Awards array (from Profile model)
        awards: refreshedProfile.awards || [],
        // Featured videos array (from Profile model)
        featuredVideos: refreshedProfile.featuredVideos || [],
        // Reviews array (from Profile model)
        reviews: reviews,
        // Ratings (calculated from reviews)
        ratings: ratings,
        // Certifications array (from Profile model)
        certifications: refreshedProfile.certifications || [],
        // Training categories array (from Profile model)
        trainingCategories: refreshedProfile.trainingCategories || [],
        // Languages array (from Profile model)
        languages: refreshedProfile.languages || [],
        // Industries served array (from Profile model)
        industriesServed: refreshedProfile.industriesServed || [],
        // Client types served array (from Profile model)
        clientTypesServed: refreshedProfile.clientTypesServed || [],
        // Work preferences (from Profile model)
        workPreferences: refreshedProfile.workPreferences || {
          workArrangements: [],
          sessionDurations: [],
          geographicPreference: [],
          travelWillingness: [],
          travelDetails: "",
        },
        // Skills assessment (from Profile model)
        skillsAssessment: refreshedProfile.skillsAssessment || [],
        // Training calendar (from Profile model)
        trainingCalendar: refreshedProfile.trainingCalendar || [],
        // Area of expertise (for organiser/speaker)
        areaOfExpertise: refreshedProfile.areaOfExpertise || [],
      },
    });
  } catch (error) {
    console.error("❌ Error in updateOrganiserBioController:", error);
    console.error("❌ Error stack:", error.stack);
    return sendError(res, error.message || "Failed to update bio", 500);
  }
});

