import {
  sendEmailOtp,
  sendPhoneOtp,
  verifyOtp,
  resendOtp,
} from "../services/otp.service.js";
import {
  checkEmailExists,
  checkPhoneExists,
  createExpertUser,
  updateVerificationStatus,
  completeExpertRegistration,
  getExpertByEmail,
  verifyExpertCredentials,
} from "../services/expert.service.js";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt.utils.js";
import { setAllAuthCookies, clearAuthCookies } from "../utils/cookie.utils.js";

/**
 * Expert Controller
 * Handles HTTP requests for expert registration flow
 * Database-agnostic - uses service layer for all database operations
 */

/**
 * Send email OTP
 * POST /api/user/expert/send-email-otp
 */
export const sendEmailOtpController = async (req, res, next) => {
  try {
    const { email, fullName } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if email already exists and registration is completed
    // Only check if database is connected, otherwise skip check and allow OTP
    let existingUser = null;
    try {
      existingUser = await getExpertByEmail(email);
      if (existingUser && existingUser.registrationCompleted) {
        console.log(`Email ${email} already registered with completed registration`);
        return res.status(400).json({
          success: false,
          message: "Email already registered. Please use a different email or login.",
        });
      }
      
      // If user exists but registration not completed, allow OTP resend
      if (existingUser && !existingUser.registrationCompleted) {
        console.log(`Email ${email} exists but registration not completed - allowing OTP resend`);
      }
    } catch (dbError) {
      // If database is not connected, log warning but continue with OTP sending
      if (dbError.message.includes("not connected")) {
        console.warn(`⚠️ Database not connected, skipping email check for ${email}`);
        console.warn("⚠️ OTP will be sent, but email verification will be skipped");
      } else {
        // For other errors, rethrow
        throw dbError;
      }
    }

    console.log(`Sending OTP to email: ${email}`);
    await sendEmailOtp(email, fullName);
    console.log(`OTP sent successfully to: ${email}`);

    res.status(200).json({
      success: true,
      message: "OTP sent to email successfully",
    });
  } catch (error) {
    console.error("Error in sendEmailOtpController:", error);
    console.error("Error stack:", error.stack);
    
    // Return more detailed error message
    const errorMessage = error.message || "Failed to send OTP";
    
    // Check if it's a database connection error
    if (error.message.includes("not connected") || error.message.includes("buffering timed out")) {
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please check your MongoDB connection string and try again.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
    
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verify email OTP
 * POST /api/user/expert/verify-email-otp
 */
export const verifyEmailOtpController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Normalize email to lowercase for consistent verification
    const normalizedEmail = email.toLowerCase().trim();
    await verifyOtp(normalizedEmail, "email", otp);

    // Update verification status if user exists (use normalized email)
    try {
      await updateVerificationStatus(normalizedEmail, "email", true);
    } catch (error) {
      // User might not exist yet, which is fine
      console.log("User not found for verification update, will be created later");
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Invalid or expired OTP",
    });
  }
};

/**
 * Send phone OTP
 * POST /api/user/expert/send-phone-otp
 */
export const sendPhoneOtpController = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Check if phone already exists
    const phoneExists = await checkPhoneExists(phoneNumber);
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    const result = await sendPhoneOtp(phoneNumber);

    res.status(200).json({
      success: true,
      message: "OTP sent to phone successfully",
      ...(result.otp && { otp: result.otp }), // Include OTP in dev mode
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify phone OTP
 * POST /api/user/expert/verify-phone-otp
 */
export const verifyPhoneOtpController = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    // Normalize phone number (remove non-digits) for consistent verification
    const normalizedPhone = phoneNumber.replace(/\D/g, "");
    await verifyOtp(normalizedPhone, "phone", otp);

    // Update verification status if user exists (use normalized phone)
    try {
      await updateVerificationStatus(normalizedPhone, "phone", true);
    } catch (error) {
      // User might not exist yet, which is fine
      console.log("User not found for verification update, will be created later");
    }

    res.status(200).json({
      success: true,
      message: "Phone verified successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Invalid or expired OTP",
    });
  }
};

/**
 * Resend OTP
 * POST /api/user/expert/resend-otp
 */
export const resendOtpController = async (req, res, next) => {
  try {
    const { identifier, type, fullName } = req.body;

    if (!identifier || !type) {
      return res.status(400).json({
        success: false,
        message: "Identifier and type are required",
      });
    }

    if (!["email", "phone"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be 'email' or 'phone'",
      });
    }

    const result = await resendOtp(identifier, type, fullName);

    res.status(200).json({
      success: true,
      message: `OTP resent to ${type} successfully`,
      ...(result.otp && { otp: result.otp }), // Include OTP in dev mode
    });
  } catch (error) {
    next(error);
  }
};

// Password validation function
const isPasswordValid = (password) => {
  return password.length >= 6 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

/**
 * Complete expert registration with password
 * POST /api/user/expert/register
 */
export const registerExpertController = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      role,
      country,
      city,
      industry,
      password,
    } = req.body;

    // Validation
    if (!fullName || !email || !phoneNumber || !role || !country || !city || !industry || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields including password are required",
      });
    }

    if (!["speaker", "trainer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 'speaker' or 'trainer'",
      });
    }

    // Validate password
    if (!isPasswordValid(password)) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character" 
      });
    }

    // Check if user already exists
    const existingUser = await getExpertByEmail(email);
    if (existingUser && existingUser.registrationCompleted) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // Create or update expert user
    let expertUser;
    if (existingUser) {
      // Update existing user
      existingUser.fullName = fullName;
      existingUser.phoneNumber = phoneNumber;
      existingUser.role = role;
      existingUser.country = country;
      existingUser.city = city;
      existingUser.industry = industry;
      existingUser.password = password; // Will be hashed in pre-save hook
      await existingUser.save();
      expertUser = existingUser;
    } else {
      // Create new user
      expertUser = await createExpertUser({
        fullName,
        email,
        phoneNumber,
        role,
        country,
        city,
        industry,
        emailVerified: true, // Assuming OTPs were verified in previous steps
        phoneVerified: true,
        password, // Will be hashed in pre-save hook
      });
    }

    // Complete registration
    await completeExpertRegistration(email, password);

    // Reload user without password
    expertUser = await getExpertByEmail(email);

    // Generate JWT tokens
    const tokens = generateTokenPair(expertUser);

    // Set secure cookies
    setAllAuthCookies(res, tokens, expertUser);

    // Determine redirect URL based on role
    let redirectUrl = '/dashboard';
    switch (expertUser.role) {
      case 'speaker':
        redirectUrl = '/profile/speaker';
        break;
      case 'trainer':
        redirectUrl = '/profile/trainer';
        break;
      default:
        redirectUrl = '/dashboard';
    }

    res.status(201).json({
      success: true,
      message: "Expert registration completed successfully",
      user: {
        _id: expertUser._id,
        fullName: expertUser.fullName,
        email: expertUser.email,
        phoneNumber: expertUser.phoneNumber,
        role: expertUser.role,
        country: expertUser.country,
        city: expertUser.city,
        industry: expertUser.industry,
        registrationCompleted: true,
      },
      redirectUrl,
      tokens: {
        accessToken: tokens.accessToken,
        // Don't send refresh token to client (it's in httpOnly cookie)
      },
    });
  } catch (error) {
    if (error.message.includes("already registered")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Check email availability
 * GET /api/user/expert/check-email/:email
 */
export const checkEmailController = async (req, res, next) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const exists = await checkEmailExists(email);

    res.status(200).json({
      success: true,
      available: !exists,
      message: exists ? "Email already registered" : "Email available",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check phone availability
 * GET /api/user/expert/check-phone/:phoneNumber
 */
export const checkPhoneController = async (req, res, next) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const exists = await checkPhoneExists(phoneNumber);

    res.status(200).json({
      success: true,
      available: !exists,
      message: exists ? "Phone number already registered" : "Phone number available",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login expert user
 * POST /api/user/expert/login
 */
export const loginExpertController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await verifyExpertCredentials(email, password);

    // Generate JWT tokens
    const tokens = generateTokenPair(user);

    // Set secure cookies
    setAllAuthCookies(res, tokens, user);

    // Determine redirect URL based on role
    let redirectUrl = '/dashboard';
    switch (user.role) {
      case 'speaker':
        redirectUrl = '/profile/speaker';
        break;
      case 'trainer':
        redirectUrl = '/profile/trainer';
        break;
      default:
        redirectUrl = '/dashboard';
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        country: user.country,
        city: user.city,
        industry: user.industry,
        registrationCompleted: user.registrationCompleted,
      },
      redirectUrl,
      tokens: {
        accessToken: tokens.accessToken,
        // Don't send refresh token to client (it's in httpOnly cookie)
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || "Invalid credentials",
    });
  }
};

/**
 * Get current expert user
 * GET /api/user/expert/me
 */
export const getCurrentExpertController = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await getExpertByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        country: user.country,
        city: user.city,
        industry: user.industry,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        registrationCompleted: user.registrationCompleted,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout expert user
 * POST /api/user/expert/logout
 */
export const logoutExpertController = async (req, res, next) => {
  try {
    // Clear authentication cookies
    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/user/expert/refresh-token
 */
export const refreshExpertTokenController = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.expertRefreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided",
        code: "NO_REFRESH_TOKEN",
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await getExpertByEmail(decoded.email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Generate new token pair
    const tokens = generateTokenPair(user);

    // Set new cookies
    setAllAuthCookies(res, tokens, user);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      tokens: {
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    clearAuthCookies(res);
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
      code: "INVALID_REFRESH_TOKEN",
    });
  }
};

/**
 * Check authentication status
 * GET /api/user/expert/status
 */
export const checkExpertAuthStatusController = async (req, res, next) => {
  try {
    if (req.user) {
      const user = await getExpertByEmail(req.user.email);

      return res.status(200).json({
        success: true,
        isAuthenticated: true,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          country: user.country,
          city: user.city,
          industry: user.industry,
          registrationCompleted: user.registrationCompleted,
        },
      });
    } else {
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        message: "Not authenticated",
      });
    }
  } catch (error) {
    next(error);
  }
};

