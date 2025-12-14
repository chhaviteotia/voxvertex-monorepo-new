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

  // Map experience to match frontend expectations (title, organization, start, end, description)
  const mappedExperience = (profile.experience || []).map((exp) => ({
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

  // Map education to match frontend expectations (degree, institution, field, start, end, grade)
  const mappedEducation = (profile.education || []).map((edu) => ({
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
  const reviews = profile.reviews || [];
  let ratings = profile.ratings || { overall: { average: 0, count: 0 } };
  
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

  // Merge user and profile data for response
  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      email: user.email,
      phoneNumber: user.phoneNumber || user.mobileNo || null,
      mobileNo: user.mobileNo || user.phoneNumber || null,
      phone: user.phoneNumber || user.mobileNo || null,
      role: user.role,
      // Profile fields (from Profile model)
      professionalTitle: profile.professionalTitle || null,
      yearsOfExperience: profile.yearsOfExperience || null,
      timeZone: profile.timeZone || null,
      profileImageUrl: profile.profileImageUrl || null,
      // Location fields (from User model)
      city: user.city || null,
      country: user.country || null,
      location: user.city && user.country ? `${user.city}, ${user.country}` : (user.city || user.country || null),
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
      // Experience array (mapped to match frontend)
      experience: mappedExperience,
      // Education array (mapped to match frontend)
      education: mappedEducation,
      // Awards array (from Profile model)
      awards: profile.awards || [],
      // Featured videos array (from Profile model)
      featuredVideos: profile.featuredVideos || [],
      // Reviews array (from Profile model)
      reviews: reviews,
      // Ratings (calculated from reviews)
      ratings: ratings,
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
      // Area of expertise (for organiser/speaker)
      areaOfExpertise: profile.areaOfExpertise || [],
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
    message: "Profile updated successfully",
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

/**
 * Update profile bio
 * PUT /api/profile/bio
 */
export const updateBioController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { bio } = req.body;

  if (bio === undefined) {
    return sendError(res, "Bio is required", 400);
  }

  // Update user profile with bio
  const { user: updatedUser, profile: updatedProfile } = await updateUserProfile(req.user.email, { bio });

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

