import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess, sendError, sendValidationError } from "../../utils/response.utils.js";
import { getUserByEmail, updateUserProfile, getOrCreateProfile } from "../services/profile.service.js";
import Profile from "../models/profile.js";

/**
 * Profile Controller
 * Handles profile-related operations for all user types
 */

/**
 * Get user profile
 * GET /api/profile/:userType
 */
export const getProfileController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const user = await getUserByEmail(req.user.email);

  if (!user) {
    return sendError(res, "User not found", 404);
  }

  // Get or create profile
  const profile = await getOrCreateProfile(user._id);

  // Merge user and profile data for response
  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      // Profile fields (from Profile model)
      professionalTitle: profile.professionalTitle || null,
      yearsOfExperience: profile.yearsOfExperience || null,
      timeZone: profile.timeZone || null,
      profileImageUrl: profile.profileImageUrl || null,
      // Location fields (from User model)
      city: user.city || null,
      country: user.country || null,
      industry: user.industry || null,
      // Other fields
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      registrationCompleted: user.registrationCompleted,
      // Bio/About field (from Profile model)
      bio: profile.bio || null,
      // Contact info fields (from Profile model)
      website: profile.website || null,
      linkedin: profile.linkedin || null,
      twitter: profile.twitter || null,
      // Experience array (from Profile model)
      experience: profile.experience || [],
      // Education array (from Profile model)
      education: profile.education || [],
      // Certifications array (from Profile model)
      certifications: profile.certifications || [],
      // Training categories array (from Profile model)
      trainingCategories: profile.trainingCategories || [],
      // Languages array (from Profile model)
      languages: profile.languages || [],
      // Industries served array (from Profile model)
      industriesServed: profile.industriesServed || [],
      // Client types served array (from Profile model)
      clientTypesServed: profile.clientTypesServed || [],
      // Work preferences (from Profile model)
      workPreferences: profile.workPreferences || {
        workArrangements: [],
        sessionDurations: [],
        geographicPreference: [],
        travelWillingness: [],
        travelDetails: "",
      },
      // Skills assessment (from Profile model)
      skillsAssessment: profile.skillsAssessment || [],
      // Training calendar (from Profile model)
      trainingCalendar: profile.trainingCalendar || [],
    },
  });
});

/**
 * Update user profile
 * PUT /api/profile/:userType
 */
export const updateProfileController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { userType } = req.params;
  const {
    professionalTitle,
    yearsOfExperience,
    timeZone,
    currentLocation, // Format: "City, Country" - will be parsed
    city,
    country,
    industry,
    bio, // About/Bio text
    website, // Website URL
    linkedin, // LinkedIn profile
    twitter, // Twitter handle
    experience, // Work experience array
    education, // Education array
    certifications, // Certifications array
    trainingCategories, // Training categories array
    languages, // Languages array
    industriesServed, // Industries served array
    clientTypesServed, // Client types served array
    workPreferences, // Work preferences object
    skillsAssessment, // Skills assessment array
    trainingCalendar, // Training calendar array
  } = req.body;

  // Parse currentLocation if provided (format: "City, Country")
  let parsedCity = city;
  let parsedCountry = country;
  
  if (currentLocation && !city && !country) {
    const parts = currentLocation.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      parsedCity = parts[0];
      parsedCountry = parts.slice(1).join(", "); // Handle cases like "New York, NY, USA"
    } else if (parts.length === 1) {
      parsedCity = parts[0];
    }
  }

  // Build update data
  const updateData = {};
  if (professionalTitle !== undefined) updateData.professionalTitle = professionalTitle;
  if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
  if (timeZone !== undefined) updateData.timeZone = timeZone;
  if (parsedCity !== undefined) updateData.city = parsedCity;
  if (parsedCountry !== undefined) updateData.country = parsedCountry;
    if (industry !== undefined) updateData.industry = industry;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (twitter !== undefined) updateData.twitter = twitter;
    if (experience !== undefined) updateData.experience = experience;
    if (education !== undefined) updateData.education = education;
    if (certifications !== undefined) updateData.certifications = certifications;
    if (trainingCategories !== undefined) updateData.trainingCategories = trainingCategories;
    if (languages !== undefined) updateData.languages = languages;
    if (industriesServed !== undefined) updateData.industriesServed = industriesServed;
    if (clientTypesServed !== undefined) updateData.clientTypesServed = clientTypesServed;
    if (workPreferences !== undefined) updateData.workPreferences = workPreferences;
    if (skillsAssessment !== undefined) updateData.skillsAssessment = skillsAssessment;
    if (trainingCalendar !== undefined) updateData.trainingCalendar = trainingCalendar;

    // Update user profile
  const { user: updatedUser, profile: updatedProfile } = await updateUserProfile(req.user.email, updateData);

  // Return response with merged user and profile data
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      // Profile fields (from Profile model)
      professionalTitle: updatedProfile.professionalTitle || null,
      yearsOfExperience: updatedProfile.yearsOfExperience || null,
      timeZone: updatedProfile.timeZone || null,
      profileImageUrl: updatedProfile.profileImageUrl || null,
      // Location fields (from User model)
      city: updatedUser.city || null,
      country: updatedUser.country || null,
      industry: updatedUser.industry || null,
      // Bio/About field (from Profile model)
      bio: updatedProfile.bio || null,
      // Contact info fields (from Profile model)
      website: updatedProfile.website || null,
      linkedin: updatedProfile.linkedin || null,
      twitter: updatedProfile.twitter || null,
      // Experience array (from Profile model)
      experience: updatedProfile.experience || [],
      // Education array (from Profile model)
      education: updatedProfile.education || [],
      // Certifications array (from Profile model)
      certifications: updatedProfile.certifications || [],
      // Training categories array (from Profile model)
      trainingCategories: updatedProfile.trainingCategories || [],
      // Languages array (from Profile model)
      languages: updatedProfile.languages || [],
      // Industries served array (from Profile model)
      industriesServed: updatedProfile.industriesServed || [],
      // Client types served array (from Profile model)
      clientTypesServed: updatedProfile.clientTypesServed || [],
      // Work preferences (from Profile model)
      workPreferences: updatedProfile.workPreferences || {
        workArrangements: [],
        sessionDurations: [],
        geographicPreference: [],
        travelWillingness: [],
        travelDetails: "",
      },
      // Skills assessment (from Profile model)
      skillsAssessment: updatedProfile.skillsAssessment || [],
      // Training calendar (from Profile model)
      trainingCalendar: updatedProfile.trainingCalendar || [],
    },
  });
});

