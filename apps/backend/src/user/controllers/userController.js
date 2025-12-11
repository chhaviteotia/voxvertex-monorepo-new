import {
  sendEmailOtp,
  sendPhoneOtp,
  verifyOtp,
  resendOtp,
} from "../shared/services/otp.service.js";
import {
  checkEmailExists,
  checkPhoneExists,
  createUser,
  updateVerificationStatus,
  completeRegistration,
  getUserByEmail,
  verifyCredentials,
} from "../services/user.service.js";
import { generateTokenPair, verifyRefreshToken } from "../shared/utils/jwt.utils.js";
import { setAllAuthCookies, clearAuthCookies } from "../shared/utils/cookie.utils.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess, sendError, sendValidationError } from "../../utils/response.utils.js";

/**
 * Unified User Controller
 * Handles HTTP requests for all user types: speaker, trainer, organiser, participant
 * Uses shared OTP service and unified user service
 */

/**
 * Send email OTP
 * POST /api/user/:userType/send-email-otp
 * userType: expert (speaker/trainer), organiser, participant
 */
export const sendEmailOtpController = asyncHandler(async (req, res) => {
  const { userType } = req.params;
  const { email, fullName } = req.body;

  if (!email) {
    return sendValidationError(res, "Email is required");
  }

  // Validate userType
  const validUserTypes = ['expert', 'organiser', 'participant'];
  if (!validUserTypes.includes(userType)) {
    return sendValidationError(res, "Invalid user type. Must be: expert, organiser, or participant");
  }

  // Check if email already exists (regardless of registration status)
  // Email must be unique across ALL user types
  let existingUser = null;
  try {
    existingUser = await getUserByEmail(email);
    if (existingUser) {
      if (existingUser.registrationCompleted) {
        return sendError(res, "Email already registered. Please use a different email or login.", 400);
      }
      // If user exists but registration not completed, check if they're trying to register with a different role
      // For expert userType, role can be speaker or trainer (both are valid and interchangeable)
      // For organiser/participant, role must match exactly
      if (existingUser.role) {
        const existingRole = String(existingUser.role).toLowerCase().trim();
        console.log(`🔍 Checking role compatibility: userType=${userType}, existingRole=${existingRole}, registrationCompleted=${existingUser.registrationCompleted}`);
        
        if (userType === 'expert') {
          // For experts, both speaker and trainer are valid - allow switching between them
          const validExpertRoles = ["speaker", "trainer"];
          if (!validExpertRoles.includes(existingRole)) {
            return sendError(res, `This email is already associated with a ${existingUser.role} account. Please use a different email.`, 400);
          }
          // If existing role is speaker or trainer, allow OTP resend (user can switch roles during registration)
          console.log(`✅ Allowing OTP for expert userType with existing role: ${existingRole}`);
        } else if (userType === 'organiser' && existingRole !== 'organiser') {
          return sendError(res, `This email is already associated with a ${existingUser.role} account. Please use a different email.`, 400);
        } else if (userType === 'participant' && existingRole !== 'participant') {
          return sendError(res, `This email is already associated with a ${existingUser.role} account. Please use a different email.`, 400);
        }
      }
      console.log(`Email ${email} exists but registration not completed - allowing OTP resend`);
    }
  } catch (dbError) {
    if (dbError.message.includes("not connected")) {
      console.warn(`⚠️ Database not connected, skipping email check for ${email}`);
    } else {
      throw dbError;
    }
  }

  await sendEmailOtp(email, fullName || null, userType);

  sendSuccess(res, null, "OTP sent to email successfully");
});

/**
 * Verify email OTP
 * POST /api/user/:userType/verify-email-otp
 */
export const verifyEmailOtpController = asyncHandler(async (req, res) => {
  const { userType } = req.params;
  const { email, otp } = req.body;

  if (!email || !otp) {
    return sendValidationError(res, "Email and OTP are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const otpString = String(otp).trim();
  
  await verifyOtp(normalizedEmail, "email", otpString, userType);

  // Update verification status (creates user if doesn't exist)
  // Pass userType to set default role
  await updateVerificationStatus(normalizedEmail, "email", true, null, userType);

  sendSuccess(res, null, "Email verified successfully");
});

/**
 * Send phone OTP
 * POST /api/user/:userType/send-phone-otp
 */
export const sendPhoneOtpController = asyncHandler(async (req, res) => {
  const { userType } = req.params;
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return sendValidationError(res, "Phone number is required");
  }

  // Only expert (speaker/trainer) requires phone verification
  if (userType !== 'expert') {
    return sendError(res, "Phone OTP is only required for expert (speaker/trainer) registration", 400);
  }

  await sendPhoneOtp(phoneNumber, userType);

  sendSuccess(res, null, "OTP sent to phone successfully");
});

/**
 * Verify phone OTP
 * POST /api/user/:userType/verify-phone-otp
 */
export const verifyPhoneOtpController = asyncHandler(async (req, res) => {
  const { userType } = req.params;
  const { phoneNumber, otp, email } = req.body;

  if (!phoneNumber || !otp) {
    return sendValidationError(res, "Phone number and OTP are required");
  }

  if (userType !== 'expert') {
    return sendError(res, "Phone OTP verification is only for expert (speaker/trainer) registration", 400);
  }

  const normalizedPhone = phoneNumber.replace(/\D/g, "");
  const otpString = String(otp).trim();
  
  await verifyOtp(normalizedPhone, "phone", otpString, userType);

  // Update verification status
  // Email is optional but highly recommended - if provided, we'll use it to find user
  // If not provided, we'll try to find user by other means (phone number or emailVerified user)
  const normalizedEmail = email ? email.toLowerCase().trim() : null;
  const updatedUser = await updateVerificationStatus(normalizedPhone, "phone", true, normalizedEmail, userType);
  
  console.log(`✅ Phone verified successfully for user: ${updatedUser.email || 'unknown'}`);
  console.log(`   Phone Number: ${updatedUser.phoneNumber}`);
  console.log(`   Phone Verified: ${updatedUser.phoneVerified}`);

  sendSuccess(res, null, "Phone verified successfully");
});

/**
 * Resend OTP
 * POST /api/user/:userType/resend-otp
 */
export const resendOtpController = asyncHandler(async (req, res) => {
  const { userType } = req.params;
  const { identifier, type, fullName } = req.body;

  if (!identifier || !type) {
    return sendValidationError(res, "Identifier and type are required");
  }

  if (!["email", "phone"].includes(type)) {
    return sendValidationError(res, "Type must be 'email' or 'phone'");
  }

  const displayName = fullName || null;
  const result = await resendOtp(identifier, type, displayName, userType);

  sendSuccess(res, result, `OTP resent to ${type} successfully`);
});

// Password validation function
const isPasswordValid = (password) => {
  return password.length >= 6 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

/**
 * Complete user registration
 * POST /api/user/:userType/register
 */
export const registerUserController = asyncHandler(async (req, res) => {
  const { userType } = req.params;
  const {
    // Common fields
    fullName,
    email,
    phoneNumber,
    password,
    role,
    
    // Expert fields (speaker/trainer)
    country,
    city,
    industry,
    subscriptionPlan,
    
    // Organiser fields
    // Note: userType in body is for independent/organization choice, not the user type from URL
    userType: organiserUserType, // This will be "independent" or "organization" or undefined
    companyTitle,
    activities,
  } = req.body;
  
  console.log(`📝 Organiser userType from body: ${organiserUserType}`);

  console.log(`📝 Registration request for userType: ${userType}`);
  console.log(`📝 Request body:`, JSON.stringify(req.body, null, 2));

  // Validate userType
  const validUserTypes = ['expert', 'organiser', 'participant'];
  if (!validUserTypes.includes(userType)) {
    console.error(`❌ Invalid userType: ${userType}`);
    return sendValidationError(res, "Invalid user type");
  }

  // Role validation
  if (userType === 'expert' && !["speaker", "trainer"].includes(role)) {
    return sendValidationError(res, "Role must be 'speaker' or 'trainer' for expert registration");
  }
  if (userType === 'organiser' && role && role !== 'organiser') {
    return sendValidationError(res, "Role must be 'organiser'");
  }
  if (userType === 'participant' && role && role !== 'participant') {
    return sendValidationError(res, "Role must be 'participant'");
  }
  
  // For organiser, if role is not provided, set it to 'organiser'
  if (userType === 'organiser' && !role) {
    role = 'organiser';
  }
  
  // For participant, if role is not provided, set it to 'participant'
  if (userType === 'participant' && !role) {
    role = 'participant';
  }

  // Validate required fields based on user type
  if (userType === 'expert') {
    if (!fullName || !email || !phoneNumber || !role || !country || !city || !industry || !password) {
      console.error(`❌ Expert validation failed - missing fields`);
      return sendValidationError(res, "All fields including password are required for expert registration");
    }
  } else if (userType === 'organiser') {
    if (!fullName || !email || !password) {
      console.error(`❌ Organiser validation failed - missing required fields`);
      console.error(`   fullName: ${fullName ? '✓' : '✗'}, email: ${email ? '✓' : '✗'}, password: ${password ? '✓' : '✗'}`);
      return sendValidationError(res, "Full name, email, and password are required");
    }
  } else if (userType === 'participant') {
    if (!fullName || !email || !password) {
      console.error(`❌ Participant validation failed - missing required fields`);
      return sendValidationError(res, "Full name, email, and password are required");
    }
  }

  // Validate password
  if (!isPasswordValid(password)) {
    console.error(`❌ Password validation failed`);
    return sendValidationError(res, "Password must be at least 6 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character");
  }
  
  console.log(`✅ All validations passed for ${userType}`);

  // Check if email already exists (regardless of role or registration status)
  // Email must be unique across ALL user types (trainer, speaker, organiser, participant)
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    if (existingUser.registrationCompleted) {
      return sendError(res, "This email is already registered. Please use a different email or login.", 400);
    }
    // If user exists but registration not completed, check if they're trying to register with a different role
    // For expert userType, both speaker and trainer are valid and interchangeable
    if (existingUser.role) {
      const existingRole = String(existingUser.role).toLowerCase().trim();
      const newRole = String(role).toLowerCase().trim();
      
      if (existingRole !== newRole) {
        // Allow switching between speaker and trainer for expert userType
        if (userType === 'expert' && 
            ["speaker", "trainer"].includes(existingRole) && 
            ["speaker", "trainer"].includes(newRole)) {
          // Allow role switch between speaker and trainer
          console.log(`✅ Allowing role switch from ${existingUser.role} to ${role} for expert userType`);
        } else {
          // Different role types - not allowed
          return sendError(res, `This email is already associated with a ${existingUser.role} account. Please use a different email.`, 400);
        }
      }
    }
  }

  // Normalize phone number (remove non-digits) to match verification format
  const normalizedPhoneNumber = phoneNumber ? phoneNumber.replace(/\D/g, "") : null;

  // Build registration data
  const registrationData = {
    fullName,
    email,
    phoneNumber: normalizedPhoneNumber,
    role,
    password,
  };

  // Add role-specific fields
  if (userType === 'expert') {
    registrationData.country = country;
    registrationData.city = city;
    registrationData.industry = industry;
    registrationData.subscriptionPlan = subscriptionPlan || "starter";
  } else if (userType === 'organiser') {
    // userType field in User model is for independent/organization choice
    // Only set it if organiserUserType is provided and valid (not "organiser")
    if (organiserUserType && 
        organiserUserType !== "organiser" && 
        ["independent", "organization"].includes(organiserUserType)) {
      registrationData.userType = organiserUserType;
      console.log(`✅ Setting userType to: ${organiserUserType}`);
    } else if (organiserUserType === "organiser") {
      console.error(`❌ Invalid userType value: "organiser". Should be "independent" or "organization"`);
      // Don't set userType if it's "organiser" - it's optional anyway
    } else {
      console.log(`ℹ️  userType not provided or invalid, skipping (optional field)`);
    }
    // Don't set userType if it's not provided or invalid (it's optional)
    if (companyTitle) {
      registrationData.companyTitle = companyTitle;
    }
    if (activities && Array.isArray(activities) && activities.length > 0) {
      registrationData.activities = activities;
    }
  }

  // Create or update user
  let user;
  if (existingUser) {
    // Update existing user - preserve verification status
    // Preserve emailVerified and phoneVerified if they were already set
    if (existingUser.emailVerified) {
      registrationData.emailVerified = true;
    }
    if (existingUser.phoneVerified) {
      registrationData.phoneVerified = true;
    }
    // Update user with registration data
    Object.assign(existingUser, registrationData);
    await existingUser.save();
    user = existingUser;
  } else {
    // Create new user - check if email was verified via OTP
    // If user was created during OTP verification, it will have verified flags
    const verifiedUser = await getUserByEmail(email);
    if (verifiedUser) {
      // User exists from OTP verification, update it
      // Preserve verification status
      if (verifiedUser.emailVerified) {
        registrationData.emailVerified = true;
      }
      // Check if phone number matches (normalized) - if so, preserve phoneVerified
      const existingPhoneNormalized = verifiedUser.phoneNumber ? String(verifiedUser.phoneNumber).replace(/\D/g, "") : null;
      const newPhoneNormalized = normalizedPhoneNumber ? String(normalizedPhoneNumber).replace(/\D/g, "") : null;
      
      if (verifiedUser.phoneVerified && existingPhoneNormalized && newPhoneNormalized && existingPhoneNormalized === newPhoneNormalized) {
        // Phone number matches and was verified - preserve verification status
        registrationData.phoneVerified = true;
        console.log(`✅ Preserving phoneVerified=true for phone: ${existingPhoneNormalized}`);
      } else if (verifiedUser.phoneVerified) {
        // Phone was verified but number might be different - still preserve if phone number is provided
        registrationData.phoneVerified = true;
        console.log(`✅ Preserving phoneVerified=true (phone number may have changed)`);
      } else {
        console.log(`⚠️ Phone not verified yet for user: ${email}`);
      }
      
      // Update with registration data
      Object.assign(verifiedUser, registrationData);
      await verifiedUser.save();
      user = verifiedUser;
    } else {
      // Create new user - but check if we should set verified flags
      // This shouldn't happen if OTP was verified, but handle it anyway
      user = await createUser(registrationData);
    }
  }

  // Refresh user from database to get latest verification status
  user = await getUserByEmail(email);
  
  // Debug logging
  console.log(`🔍 User verification status before completeRegistration:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Email Verified: ${user.emailVerified}`);
  console.log(`   Phone Number: ${user.phoneNumber}`);
  console.log(`   Phone Verified: ${user.phoneVerified}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Registration Completed: ${user.registrationCompleted}`);

  // Complete registration
  await completeRegistration(email, password, registrationData);

  // Generate JWT tokens
  const tokens = generateTokenPair(user, userType);

  // Set secure cookies
  setAllAuthCookies(res, tokens, user, userType);

  // Determine redirect URL based on role
  let redirectUrl = '/dashboard';
  switch (user.role) {
    case 'speaker':
      redirectUrl = '/profile/speaker';
      break;
    case 'trainer':
      redirectUrl = '/profile/trainer';
      break;
    case 'organiser':
      redirectUrl = '/subscription/organiser'; // Organisers need to select subscription plan first
      break;
    case 'participant':
      redirectUrl = '/profile/participant';
      break;
    default:
      redirectUrl = '/dashboard';
  }

  // Return auth response with redirectUrl at top level (not wrapped in data)
  res.status(201).json({
    success: true,
    message: "Registration completed successfully",
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      registrationCompleted: user.registrationCompleted,
    },
    redirectUrl,
    tokens: {
      accessToken: tokens.accessToken,
    },
  });
});

/**
 * Check email availability
 * GET /api/user/:userType/check-email/:email
 */
export const checkEmailController = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return sendValidationError(res, "Email is required");
  }

  const exists = await checkEmailExists(email);

  sendSuccess(res, {
    available: !exists,
    message: exists ? "Email already registered" : "Email available",
  });
});

/**
 * Check phone availability
 * GET /api/user/:userType/check-phone/:phoneNumber
 */
export const checkPhoneController = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.params;

  if (!phoneNumber) {
    return sendValidationError(res, "Phone number is required");
  }

  const exists = await checkPhoneExists(phoneNumber);

  sendSuccess(res, {
    available: !exists,
    message: exists ? "Phone number already registered" : "Phone number available",
  });
});

/**
 * Unified Login user (no userType required)
 * POST /api/user/login
 * Determines user type from user's role and redirects accordingly
 */
export const unifiedLoginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log(`🔐 Unified login attempt for email: ${email}`);

  if (!email || !password) {
    return sendValidationError(res, "Email and password are required");
  }

  try {
    const user = await verifyCredentials(email, password);
    console.log(`✅ Credentials verified for user: ${user.email}, role: ${user.role}`);

    // Determine userType from role
    let userType = 'expert'; // default
    if (user.role === 'organiser') {
      userType = 'organiser';
    } else if (user.role === 'participant') {
      userType = 'participant';
    } else if (["speaker", "trainer"].includes(user.role)) {
      userType = 'expert';
    }

    // Generate JWT tokens
    let tokens;
    try {
      tokens = generateTokenPair(user, userType);
    } catch (tokenError) {
      console.error('❌ Token generation error:', tokenError.message);
      console.error('Token error stack:', tokenError.stack);
      throw new Error('Failed to generate authentication tokens. Please check server configuration.');
    }

    // Set secure cookies
    setAllAuthCookies(res, tokens, user, userType);

    // Determine redirect URL based on role
    // For login, organisers go directly to profile (subscription is only for registration)
    let redirectUrl = '/dashboard';
    switch (user.role) {
      case 'speaker':
        redirectUrl = '/profile/speaker';
        break;
      case 'trainer':
        redirectUrl = '/profile/trainer';
        break;
      case 'organiser':
        redirectUrl = '/profile/organiser'; // Organisers go to profile on login
        break;
      case 'participant':
        redirectUrl = '/profile/participant';
        break;
      default:
        redirectUrl = '/dashboard';
    }

    // Return auth response with redirectUrl at top level (not wrapped in data)
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        registrationCompleted: user.registrationCompleted,
      },
      redirectUrl,
      tokens: {
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    console.error(`❌ Login error for ${email}:`, error.message);
    console.error('Error stack:', error.stack);
    // Re-throw to let asyncHandler catch it and pass to error middleware
    throw error;
  }
});

/**
 * Get current user
 * GET /api/user/:userType/me
 */
export const getCurrentUserController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendError(res, "Not authenticated", 401);
  }

  const user = await getUserByEmail(req.user.email);

  if (!user) {
    return sendError(res, "User not found", 404);
  }

  // Get or create profile
  const { getOrCreateProfile } = await import("../../profile/services/profile.service.js");
  const profile = await getOrCreateProfile(user._id);

  // Debug: Log user data to console
  console.log("🔍 getCurrentUserController - User data:", {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  });

  // Return response with user at top level (not wrapped in data)
  // This matches the frontend expectation: { success: true, user: {...} }
  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      fullName: user.fullName || null,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      registrationCompleted: user.registrationCompleted,
      // Role-specific fields (from User model)
      ...(user.country && { country: user.country }),
      ...(user.city && { city: user.city }),
      ...(user.industry && { industry: user.industry }),
      ...(user.userType && { userType: user.userType }),
      ...(user.companyTitle && { companyTitle: user.companyTitle }),
      ...(user.activities && { activities: user.activities }),
      // Profile fields (from Profile model)
      ...(profile.professionalTitle && { professionalTitle: profile.professionalTitle }),
      ...(profile.yearsOfExperience !== undefined && { yearsOfExperience: profile.yearsOfExperience }),
      ...(profile.timeZone && { timeZone: profile.timeZone }),
      ...(profile.profileImageUrl && { profileImageUrl: profile.profileImageUrl }),
      ...(profile.bio && { bio: profile.bio }),
      // Contact info fields (from Profile model)
      ...(profile.website && { website: profile.website }),
      ...(profile.linkedin && { linkedin: profile.linkedin }),
      ...(profile.twitter && { twitter: profile.twitter }),
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
 * Logout user
 * POST /api/user/:userType/logout
 */
export const logoutUserController = asyncHandler(async (req, res) => {
  const { userType } = req.params;
  clearAuthCookies(res, userType);
  sendSuccess(res, null, "Logout successful");
});

/**
 * Refresh token
 * POST /api/user/:userType/refresh-token
 */
export const refreshTokenController = asyncHandler(async (req, res) => {
  const { userType } = req.params;
  const refreshToken = req.cookies?.[`${userType}RefreshToken`] || req.body.refreshToken;

  if (!refreshToken) {
    return sendError(res, "Refresh token is required", 401);
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await getUserByEmail(decoded.email);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const tokens = generateTokenPair(user, userType);
    setAllAuthCookies(res, tokens, user, userType);

    sendSuccess(res, {
      accessToken: tokens.accessToken,
    }, "Token refreshed successfully");
  } catch (error) {
    return sendError(res, "Invalid or expired refresh token", 401);
  }
});

/**
 * Check authentication status
 * GET /api/user/:userType/status
 */
export const checkAuthStatusController = asyncHandler(async (req, res) => {
  if (!req.user) {
    return sendSuccess(res, {
      isAuthenticated: false,
    });
  }

  const user = await getUserByEmail(req.user.email);

  if (!user) {
    return sendSuccess(res, {
      isAuthenticated: false,
    });
  }

  sendSuccess(res, {
    isAuthenticated: true,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      registrationCompleted: user.registrationCompleted,
    },
  });
});

