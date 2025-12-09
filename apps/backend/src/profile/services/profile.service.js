import { getUserByEmail } from "../../user/services/user.service.js";
import User from "../../user/models/user.js";
import Profile from "../models/profile.js";

/**
 * Profile Service
 * Business logic for profile operations
 */

/**
 * Get or create profile for a user
 * @param {String} userId - User ID
 * @returns {Object} Profile document
 */
export const getOrCreateProfile = async (userId) => {
  try {
    let profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      // Create a new profile
      profile = new Profile({ user: userId });
      await profile.save();
      
      // Update user to reference the profile
      await User.findByIdAndUpdate(userId, { profile: profile._id });
    }
    
    return profile;
  } catch (error) {
    throw new Error(`Failed to get or create profile: ${error.message}`);
  }
};

/**
 * Update user profile
 * @param {String} email - User email
 * @param {Object} updateData - Data to update
 */
export const updateUserProfile = async (email, updateData) => {
  try {
    const user = await getUserByEmail(email);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get or create profile
    const profile = await getOrCreateProfile(user._id);

    // Separate profile fields from user fields
    const profileFields = [
      'professionalTitle', 'yearsOfExperience', 'timeZone', 'bio',
      'website', 'linkedin', 'twitter', 'experience', 'education',
      'certifications', 'trainingCategories', 'languages',
      'industriesServed', 'clientTypesServed', 'workPreferences',
      'skillsAssessment', 'trainingCalendar', 'profileImageUrl'
    ];

    const userFields = ['city', 'country', 'industry'];

    // Update profile fields
    profileFields.forEach(field => {
      if (updateData[field] !== undefined) {
        profile[field] = updateData[field];
      }
    });

    // Update user fields (city, country, industry stay in User model)
    userFields.forEach(field => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    // Special handling for workPreferences (object merge)
    if (updateData.workPreferences !== undefined) {
      profile.workPreferences = {
        ...profile.workPreferences,
        ...updateData.workPreferences,
      };
    }

    await profile.save();
    await user.save();
    
    return { user, profile };
  } catch (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};

/**
 * Get user by email (re-export from user service for convenience)
 */
export { getUserByEmail } from "../../user/services/user.service.js";

