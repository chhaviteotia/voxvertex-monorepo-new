import User from "../models/user.js";
import mongoose from "mongoose";
import Profile from "../../profile/models/profile.js";

/**
 * Unified User Service
 * Business logic for all user types: speaker, trainer, organiser, participant
 * Database-agnostic design for future migration
 */

/**
 * Check if database is connected
 */
const checkDBConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Database is not connected. Please check your MongoDB connection string.");
  }
};

/**
 * Check if email already exists
 */
export const checkEmailExists = async (email) => {
  try {
    checkDBConnection();
    const user = await User.findByEmail(email);
    return !!user;
  } catch (error) {
    if (error.message.includes("not connected")) {
      throw error;
    }
    throw new Error(`Failed to check email: ${error.message}`);
  }
};

/**
 * Check if phone already exists
 */
export const checkPhoneExists = async (phoneNumber) => {
  try {
    checkDBConnection();
    const normalized = phoneNumber.replace(/\D/g, "");
    const user = await User.findByPhone(normalized);
    return !!user;
  } catch (error) {
    if (error.message.includes("not connected")) {
      throw error;
    }
    throw new Error(`Failed to check phone: ${error.message}`);
  }
};

/**
 * Create user (supports all user types)
 * @param {Object} userData - User data object
 * @param {String} userData.role - Role: speaker, trainer, organiser, participant
 */
export const createUser = async (userData) => {
  try {
    checkDBConnection();
    
    // Check if email already exists
    const emailExists = await checkEmailExists(userData.email);
    if (emailExists) {
      throw new Error("Email already registered");
    }

    // Check if phone already exists (if phone provided)
    if (userData.phoneNumber) {
      const phoneExists = await checkPhoneExists(userData.phoneNumber);
      if (phoneExists) {
        throw new Error("Phone number already registered");
      }
    }

    // Build user object based on role
    const userObject = {
      email: userData.email,
      role: userData.role,
      emailVerified: userData.emailVerified || false,
      phoneVerified: userData.phoneVerified || false,
      registrationCompleted: false,
    };

    // Add common fields
    if (userData.fullName) userObject.fullName = userData.fullName;
    if (userData.phoneNumber) userObject.phoneNumber = userData.phoneNumber;
    if (userData.password) userObject.password = userData.password;

    // Role-specific fields
    if (userData.role === "speaker" || userData.role === "trainer") {
      // Expert fields
      if (userData.country) userObject.country = userData.country;
      if (userData.city) userObject.city = userData.city;
      if (userData.industry) userObject.industry = userData.industry;
      userObject.subscriptionPlan = userData.subscriptionPlan || "starter";
      userObject.subscriptionStatus = userData.subscriptionPlan === "starter" ? "active" : "pending";
    } else if (userData.role === "organiser") {
      // Organiser fields
      if (userData.userType) userObject.userType = userData.userType;
      if (userData.companyTitle) userObject.companyTitle = userData.companyTitle;
      if (userData.activities) userObject.activities = userData.activities;
    }
    // Participant doesn't need additional fields for now

    // Create new user
    const user = new User(userObject);
    await user.save();
    
    // Create profile for the user
    const profile = new Profile({ user: user._id });
    await profile.save();
    
    // Link profile to user
    user.profile = profile._id;
    await user.save();
    
    return user;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      if (error.keyPattern?.email) {
        throw new Error("Email already registered");
      }
      if (error.keyPattern?.phoneNumber) {
        throw new Error("Phone number already registered");
      }
    }
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * Update user verification status
 * Creates a minimal user record if it doesn't exist (for OTP verification before registration)
 * @param {String} identifier - Email or phone number
 * @param {String} type - 'email' or 'phone'
 * @param {Boolean} verified - Verification status (always true when called)
 * @param {String} email - Optional email for phone verification (to link to existing user)
 * @param {String} userType - Optional userType (expert, organiser, participant) to set default role
 */
export const updateVerificationStatus = async (identifier, type, verified, email = null, userType = null) => {
  try {
    let user = null;

    // Determine default role based on userType
    let defaultRole = null;
    if (userType === 'expert') {
      // For expert, default to 'trainer' (can be changed to 'speaker' during registration)
      defaultRole = 'trainer';
    } else if (userType === 'organiser') {
      defaultRole = 'organiser';
    } else if (userType === 'participant') {
      defaultRole = 'participant';
    }

    if (type === "email") {
      user = await User.findByEmail(identifier);
      if (!user) {
        // Create a minimal user record with email verification
        // Role is required, so set default based on userType
        const userData = { 
          email: identifier, 
          emailVerified: true 
        };
        
        // Only set role if we have userType (required field)
        if (defaultRole) {
          userData.role = defaultRole;
        } else {
          // If no userType provided, we can't create user without role
          // This shouldn't happen in normal flow, but handle gracefully
          throw new Error("User type is required to create user during email verification");
        }
        
        // Don't set phoneNumber for organiser/participant (not required)
        // Only set phoneNumber for expert users
        // This prevents null value conflicts with sparse index
        if (userType !== 'expert') {
          // Explicitly don't set phoneNumber - leave it undefined
          // This prevents MongoDB from trying to index null values
        }
        
        try {
          user = new User(userData);
          await user.save();
          return user;
        } catch (saveError) {
          // Handle duplicate key errors (especially for phoneNumber index)
          if (saveError.code === 11000) {
            // If it's a phoneNumber duplicate key error, try again without phoneNumber
            if (saveError.keyPattern?.phoneNumber || saveError.keyPattern?.mobileNo) {
              console.warn("⚠️ Phone number index conflict, retrying without phoneNumber field");
              // Remove phoneNumber from userData if it exists
              delete userData.phoneNumber;
              user = new User(userData);
              await user.save();
              return user;
            }
            // Re-throw other duplicate key errors (like email)
            throw saveError;
          }
          throw saveError;
        }
      }
      // Update existing user's email verification
      await user.verifyEmail();
    } else if (type === "phone") {
      // For phone verification, user should already exist from email verification
      // Try multiple strategies to find the user:
      
      // Strategy 1: Find by email if provided
      if (email) {
        user = await User.findByEmail(email);
      }
      
      // Strategy 2: Find by phone (if user already has phone set)
      if (!user) {
        user = await User.findByPhone(identifier);
      }
      
      // Strategy 3: Find user with emailVerified=true but phoneVerified=false
      // This handles the case where email was verified but phone wasn't
      if (!user && userType) {
        // Determine role based on userType
        let roles = [];
        if (userType === 'expert') {
          roles = ['speaker', 'trainer'];
        } else if (userType === 'organiser') {
          roles = ['organiser'];
        } else if (userType === 'participant') {
          roles = ['participant'];
        }
        
        // Find user that has email verified but phone not verified yet
        user = await User.findOne({
          emailVerified: true,
          phoneVerified: { $ne: true },
          role: { $in: roles },
        });
      }
      
      if (!user) {
        // User doesn't exist - email should be verified first
        throw new Error("User not found. Please verify your email first before verifying phone number.");
      }
      
      // Update existing user's phone verification
      // Also update phone number if it wasn't set
      if (!user.phoneNumber) {
        user.phoneNumber = identifier;
      }
      await user.verifyPhone();
    }

    return user;
  } catch (error) {
    throw new Error(`Failed to update verification status: ${error.message}`);
  }
};

/**
 * Complete user registration with password
 */
export const completeRegistration = async (email, password, additionalData = {}) => {
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    // For expert (speaker/trainer), both email and phone must be verified
    if ((user.role === "speaker" || user.role === "trainer")) {
      if (!user.emailVerified) {
        throw new Error("Email must be verified before completing registration");
      }
      // Check phone verification - phone is required for experts
      if (user.phoneNumber && !user.phoneVerified) {
        console.error(`❌ Phone verification check failed:`);
        console.error(`   Phone Number: ${user.phoneNumber}`);
        console.error(`   Phone Verified: ${user.phoneVerified}`);
        throw new Error("Phone must be verified before completing registration");
      }
      // If phone number is not provided, that's also an issue for experts
      if (!user.phoneNumber) {
        console.warn(`⚠️ Expert user ${user.email} has no phone number`);
      }
    }

    // For organiser and participant, only email verification required
    if ((user.role === "organiser" || user.role === "participant") && !user.emailVerified) {
      throw new Error("Email must be verified before completing registration");
    }

    // Set password if provided
    if (password) {
      user.password = password;
    }

    // Update additional fields if provided
    if (additionalData.role) user.role = additionalData.role;
    if (additionalData.country) user.country = additionalData.country;
    if (additionalData.city) user.city = additionalData.city;
    if (additionalData.industry) user.industry = additionalData.industry;
    if (additionalData.subscriptionPlan) user.subscriptionPlan = additionalData.subscriptionPlan;
    if (additionalData.userType) user.userType = additionalData.userType;
    if (additionalData.companyTitle) user.companyTitle = additionalData.companyTitle;
    if (additionalData.activities) user.activities = additionalData.activities;

    await user.completeRegistration();
    return user;
  } catch (error) {
    throw new Error(`Failed to complete registration: ${error.message}`);
  }
};

/**
 * Verify user credentials (for login)
 */
export const verifyCredentials = async (email, password) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🔍 Looking up user with email: ${normalizedEmail}`);
    
    const user = await User.findByEmailWithPassword(normalizedEmail);
    
    if (!user) {
      console.log(`❌ User not found for email: ${normalizedEmail}`);
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    console.log(`✅ User found: ${user.email}, role: ${user.role}, hasPassword: ${!!user.password}, registrationCompleted: ${user.registrationCompleted}`);

    if (!user.password) {
      console.log(`❌ User ${user.email} has no password set`);
      const error = new Error("Password not set. Please complete registration first.");
      error.statusCode = 400;
      throw error;
    }

    if (!user.registrationCompleted) {
      console.log(`❌ User ${user.email} registration not completed`);
      const error = new Error("Registration not completed. Please complete your registration.");
      error.statusCode = 400;
      throw error;
    }

    console.log(`🔐 Comparing password for user: ${user.email}`);
    const isPasswordValid = await user.comparePassword(password);
    console.log(`🔐 Password comparison result: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for user: ${user.email}`);
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    console.log(`✅ Password verified for user: ${user.email}`);
    // Remove password from user object before returning
    user.password = undefined;
    return user;
  } catch (error) {
    // Preserve status code if already set
    if (error.statusCode) {
      console.log(`❌ Error with statusCode ${error.statusCode}: ${error.message}`);
      throw error;
    }
    // Otherwise wrap in new error with 500 status
    console.log(`❌ Unexpected error: ${error.message}`);
    const newError = new Error(error.message || "Failed to verify credentials");
    newError.statusCode = 500;
    throw newError;
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email) => {
  try {
    checkDBConnection();
    const user = await User.findByEmail(email);
    return user;
  } catch (error) {
    if (error.message.includes("not connected")) {
      throw error;
    }
    throw new Error(`Failed to get user: ${error.message}`);
  }
};

/**
 * Get user by phone
 */
export const getUserByPhone = async (phoneNumber) => {
  try {
    const user = await User.findByPhone(phoneNumber);
    return user;
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
};

