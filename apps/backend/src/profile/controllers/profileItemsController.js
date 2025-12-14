import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../../utils/response.utils.js";
import { getUserByEmail, getOrCreateProfile } from "../services/profile.service.js";

/**
 * Profile Items Controller
 * Handles CRUD operations for profile items (awards, videos, etc.)
 */

/**
 * Helper function to format profile response (same structure as getProfileController)
 */
const formatProfileResponse = (user, refreshedProfile) => {
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

  return {
    _id: user._id,
    fullName: user.fullName,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    email: user.email,
    phoneNumber: user.phoneNumber || user.mobileNo || null,
    mobileNo: user.mobileNo || user.phoneNumber || null,
    phone: user.phoneNumber || user.mobileNo || null,
    role: user.role,
    // Profile fields
    professionalTitle: refreshedProfile.professionalTitle || null,
    yearsOfExperience: refreshedProfile.yearsOfExperience || null,
    timeZone: refreshedProfile.timeZone || null,
    profileImageUrl: refreshedProfile.profileImageUrl || null,
    // Location fields
    city: user.city || null,
    country: user.country || null,
    location: user.city && user.country ? `${user.city}, ${user.country}` : (user.city || user.country || null),
    industry: user.industry || null,
    // Other fields
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    registrationCompleted: user.registrationCompleted,
    // Bio/About field
    bio: refreshedProfile.bio || null,
    // Contact info fields
    website: refreshedProfile.website || null,
    linkedin: refreshedProfile.linkedin || null,
    twitter: refreshedProfile.twitter || null,
    // Experience array (mapped)
    experience: mappedExperience,
    // Education array (mapped)
    education: mappedEducation,
    // Awards array
    awards: refreshedProfile.awards || [],
    // Featured videos array
    featuredVideos: refreshedProfile.featuredVideos || [],
    // Reviews array
    reviews: reviews,
    // Ratings (calculated)
    ratings: ratings,
    // Certifications array
    certifications: refreshedProfile.certifications || [],
    // Training categories array
    trainingCategories: refreshedProfile.trainingCategories || [],
    // Languages array
    languages: refreshedProfile.languages || [],
    // Industries served array
    industriesServed: refreshedProfile.industriesServed || [],
    // Client types served array
    clientTypesServed: refreshedProfile.clientTypesServed || [],
    // Work preferences
    workPreferences: refreshedProfile.workPreferences || {
      workArrangements: [],
      sessionDurations: [],
      geographicPreference: [],
      travelWillingness: [],
      travelDetails: "",
    },
    // Skills assessment
    skillsAssessment: refreshedProfile.skillsAssessment || [],
    // Training calendar
    trainingCalendar: refreshedProfile.trainingCalendar || [],
    // Area of expertise
    areaOfExpertise: refreshedProfile.areaOfExpertise || [],
  };
};

/**
 * Add award to profile
 * POST /api/profile/awards
 */
export const addAwardController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { title, issuer, date, description, category, url } = req.body;

  if (!title || !issuer || !date) {
    return sendError(res, "Title, issuer, and date are required", 400);
  }

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const profile = await getOrCreateProfile(user._id);

  const newAward = {
    title,
    issuer,
    date,
    description: description || null,
    category: category || null,
    url: url || null,
  };

  profile.awards = profile.awards || [];
  profile.awards.push(newAward);
  await profile.save();

  return sendSuccess(res, {
    message: "Award added successfully",
    data: profile.awards[profile.awards.length - 1],
  });
});

/**
 * Update award in profile
 * PUT /api/profile/awards/:awardId
 */
export const updateAwardController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { awardId } = req.params;
  const { title, issuer, date, description, category, url } = req.body;

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const profile = await getOrCreateProfile(user._id);

  if (!profile.awards || profile.awards.length === 0) {
    return sendError(res, "Award not found", 404);
  }

  const awardIndex = profile.awards.findIndex(
    (a) => a._id.toString() === awardId
  );

  if (awardIndex === -1) {
    return sendError(res, "Award not found", 404);
  }

  // Update award fields
  if (title !== undefined) profile.awards[awardIndex].title = title;
  if (issuer !== undefined) profile.awards[awardIndex].issuer = issuer;
  if (date !== undefined) profile.awards[awardIndex].date = date;
  if (description !== undefined) profile.awards[awardIndex].description = description;
  if (category !== undefined) profile.awards[awardIndex].category = category;
  if (url !== undefined) profile.awards[awardIndex].url = url;

  await profile.save();

  return sendSuccess(res, {
    message: "Award updated successfully",
    data: profile.awards[awardIndex],
  });
});

/**
 * Delete award from profile
 * DELETE /api/profile/awards/:awardId
 */
export const deleteAwardController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { awardId } = req.params;

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const profile = await getOrCreateProfile(user._id);

  if (!profile.awards || profile.awards.length === 0) {
    return sendError(res, "Award not found", 404);
  }

  const awardIndex = profile.awards.findIndex(
    (a) => a._id.toString() === awardId
  );

  if (awardIndex === -1) {
    return sendError(res, "Award not found", 404);
  }

  profile.awards.splice(awardIndex, 1);
  await profile.save();

  return sendSuccess(res, {
    message: "Award deleted successfully",
  });
});

/**
 * Add featured video to profile
 * POST /api/profile/videos
 */
export const addVideoController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { title, platform, videoUrl, thumbnail, description, duration, tags } = req.body;

  if (!title || !platform || !videoUrl) {
    return sendError(res, "Title, platform, and videoUrl are required", 400);
  }

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const profile = await getOrCreateProfile(user._id);

  const newVideo = {
    title,
    platform,
    videoUrl,
    thumbnail: thumbnail || null,
    description: description || null,
    duration: duration || null,
    tags: tags || [],
  };

  profile.featuredVideos = profile.featuredVideos || [];
  profile.featuredVideos.push(newVideo);
  await profile.save();

  return sendSuccess(res, {
    message: "Video added successfully",
    data: profile.featuredVideos[profile.featuredVideos.length - 1],
  });
});

/**
 * Update featured video in profile
 * PUT /api/profile/videos/:videoId
 */
export const updateVideoController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { videoId } = req.params;
  const { title, platform, videoUrl, thumbnail, description, duration, tags } = req.body;

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const profile = await getOrCreateProfile(user._id);

  if (!profile.featuredVideos || profile.featuredVideos.length === 0) {
    return sendError(res, "Video not found", 404);
  }

  const videoIndex = profile.featuredVideos.findIndex(
    (v) => v._id.toString() === videoId
  );

  if (videoIndex === -1) {
    return sendError(res, "Video not found", 404);
  }

  // Update video fields
  if (title !== undefined) profile.featuredVideos[videoIndex].title = title;
  if (platform !== undefined) profile.featuredVideos[videoIndex].platform = platform;
  if (videoUrl !== undefined) profile.featuredVideos[videoIndex].videoUrl = videoUrl;
  if (thumbnail !== undefined) profile.featuredVideos[videoIndex].thumbnail = thumbnail;
  if (description !== undefined) profile.featuredVideos[videoIndex].description = description;
  if (duration !== undefined) profile.featuredVideos[videoIndex].duration = duration;
  if (tags !== undefined) profile.featuredVideos[videoIndex].tags = tags;

  await profile.save();

  return sendSuccess(res, {
    message: "Video updated successfully",
    data: profile.featuredVideos[videoIndex],
  });
});

/**
 * Delete featured video from profile
 * DELETE /api/profile/videos/:videoId
 */
export const deleteVideoController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { videoId } = req.params;

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const profile = await getOrCreateProfile(user._id);

  if (!profile.featuredVideos || profile.featuredVideos.length === 0) {
    return sendError(res, "Video not found", 404);
  }

  const videoIndex = profile.featuredVideos.findIndex(
    (v) => v._id.toString() === videoId
  );

  if (videoIndex === -1) {
    return sendError(res, "Video not found", 404);
  }

  profile.featuredVideos.splice(videoIndex, 1);
  await profile.save();

  return sendSuccess(res, {
    message: "Video deleted successfully",
  });
});

/**
 * Add work experience to profile
 * POST /api/profile/experience
 */
export const addExperienceController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { title, organization, start, end, description, location, type, skills, achievements } = req.body;

  if (!title || !organization || !start) {
    return sendError(res, "Title, organization, and start date are required", 400);
  }

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const profile = await getOrCreateProfile(user._id);

  const newExperience = {
    title,
    company: organization,
    organization: organization,
    startDate: start,
    start: start,
    endDate: end || null,
    end: end || null,
    description: description || null,
    location: location || null,
    type: type || null,
    skills: skills || [],
    achievements: achievements || [],
  };

  profile.experience = profile.experience || [];
  profile.experience.push(newExperience);
  await profile.save();

  // Refresh profile to get latest data with all fields
  const refreshedProfile = await getOrCreateProfile(user._id);

  // Return full profile data (same structure as getProfileController)
  return sendSuccess(res, {
    message: "Experience added successfully",
    data: formatProfileResponse(user, refreshedProfile),
  });
});

/**
 * Update work experience in profile
 * PUT /api/profile/experience/:experienceId
 */
export const updateExperienceController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { experienceId } = req.params;
  const { title, organization, start, end, description, location, type, skills, achievements } = req.body;

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const profile = await getOrCreateProfile(user._id);

  if (!profile.experience || profile.experience.length === 0) {
    return sendError(res, "Experience not found", 404);
  }

  const expIndex = profile.experience.findIndex(
    (e) => e._id.toString() === experienceId
  );

  if (expIndex === -1) {
    return sendError(res, "Experience not found", 404);
  }

  // Update experience fields
  if (title !== undefined) profile.experience[expIndex].title = title;
  if (organization !== undefined) {
    profile.experience[expIndex].company = organization;
    profile.experience[expIndex].organization = organization;
  }
  if (start !== undefined) {
    profile.experience[expIndex].startDate = start;
    profile.experience[expIndex].start = start;
  }
  if (end !== undefined) {
    profile.experience[expIndex].endDate = end;
    profile.experience[expIndex].end = end;
  }
  if (description !== undefined) profile.experience[expIndex].description = description;
  if (location !== undefined) profile.experience[expIndex].location = location;
  if (type !== undefined) profile.experience[expIndex].type = type;
  if (skills !== undefined) profile.experience[expIndex].skills = skills;
  if (achievements !== undefined) profile.experience[expIndex].achievements = achievements;

  await profile.save();

  // Refresh profile to get latest data with all fields
  const refreshedProfile = await getOrCreateProfile(user._id);

  // Return full profile data (same structure as getProfileController)
  return sendSuccess(res, {
    message: "Experience updated successfully",
    data: formatProfileResponse(user, refreshedProfile),
  });
});

/**
 * Delete work experience from profile
 * DELETE /api/profile/experience/:experienceId
 */
export const deleteExperienceController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { experienceId } = req.params;

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const profile = await getOrCreateProfile(user._id);

  if (!profile.experience || profile.experience.length === 0) {
    return sendError(res, "Experience not found", 404);
  }

  const expIndex = profile.experience.findIndex(
    (e) => e._id.toString() === experienceId
  );

  if (expIndex === -1) {
    return sendError(res, "Experience not found", 404);
  }

  profile.experience.splice(expIndex, 1);
  await profile.save();

  // Refresh profile to get latest data with all fields
  const refreshedProfile = await getOrCreateProfile(user._id);

  // Return full profile data (same structure as getProfileController)
  return sendSuccess(res, {
    message: "Experience deleted successfully",
    data: formatProfileResponse(user, refreshedProfile),
  });
});

/**
 * Add education to profile
 * POST /api/profile/education
 */
export const addEducationController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { degree, institution, field, start, end, grade, location, activities, description } = req.body;

  if (!degree || !institution || !field || !start) {
    return sendError(res, "Degree, institution, field, and start date are required", 400);
  }

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const profile = await getOrCreateProfile(user._id);

  const newEducation = {
    degree,
    institution,
    fieldOfStudy: field,
    field: field,
    year: start,
    start: start,
    end: end || null,
    grade: grade || null,
    location: location || null,
    activities: activities || [],
    description: description || null,
  };

  profile.education = profile.education || [];
  profile.education.push(newEducation);
  await profile.save();

  // Refresh profile to get latest data with all fields
  const refreshedProfile = await getOrCreateProfile(user._id);

  // Return full profile data (same structure as getProfileController)
  return sendSuccess(res, {
    message: "Education added successfully",
    data: formatProfileResponse(user, refreshedProfile),
  });
});

/**
 * Update education in profile
 * PUT /api/profile/education/:educationId
 */
export const updateEducationController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { educationId } = req.params;
  const { degree, institution, field, start, end, grade, location, activities, description } = req.body;

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const profile = await getOrCreateProfile(user._id);

  if (!profile.education || profile.education.length === 0) {
    return sendError(res, "Education not found", 404);
  }

  const eduIndex = profile.education.findIndex(
    (e) => e._id.toString() === educationId
  );

  if (eduIndex === -1) {
    return sendError(res, "Education not found", 404);
  }

  // Update education fields
  if (degree !== undefined) profile.education[eduIndex].degree = degree;
  if (institution !== undefined) profile.education[eduIndex].institution = institution;
  if (field !== undefined) {
    profile.education[eduIndex].fieldOfStudy = field;
    profile.education[eduIndex].field = field;
  }
  if (start !== undefined) {
    profile.education[eduIndex].year = start;
    profile.education[eduIndex].start = start;
  }
  if (end !== undefined) profile.education[eduIndex].end = end;
  if (grade !== undefined) profile.education[eduIndex].grade = grade;
  if (location !== undefined) profile.education[eduIndex].location = location;
  if (activities !== undefined) profile.education[eduIndex].activities = activities;
  if (description !== undefined) profile.education[eduIndex].description = description;

  await profile.save();

  // Refresh profile to get latest data with all fields
  const refreshedProfile = await getOrCreateProfile(user._id);

  // Return full profile data (same structure as getProfileController)
  return sendSuccess(res, {
    message: "Education updated successfully",
    data: formatProfileResponse(user, refreshedProfile),
  });
});

/**
 * Delete education from profile
 * DELETE /api/profile/education/:educationId
 */
export const deleteEducationController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const { educationId } = req.params;

  const user = await getUserByEmail(req.user.email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const profile = await getOrCreateProfile(user._id);

  if (!profile.education || profile.education.length === 0) {
    return sendError(res, "Education not found", 404);
  }

  const eduIndex = profile.education.findIndex(
    (e) => e._id.toString() === educationId
  );

  if (eduIndex === -1) {
    return sendError(res, "Education not found", 404);
  }

  profile.education.splice(eduIndex, 1);
  await profile.save();

  // Refresh profile to get latest data with all fields
  const refreshedProfile = await getOrCreateProfile(user._id);

  // Return full profile data (same structure as getProfileController)
  return sendSuccess(res, {
    message: "Education deleted successfully",
    data: formatProfileResponse(user, refreshedProfile),
  });
});

