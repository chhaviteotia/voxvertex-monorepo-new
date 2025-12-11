import express from "express";
import {
  sendEmailOtpController,
  verifyEmailOtpController,
  sendPhoneOtpController,
  verifyPhoneOtpController,
  resendOtpController,
  registerUserController,
  checkEmailController,
  checkPhoneController,
  unifiedLoginController,
  getCurrentUserController,
  logoutUserController,
  refreshTokenController,
  checkAuthStatusController,
} from "../controllers/userController.js";
import { authenticateUser } from "../middleware/userAuth.js";
import { validateEmailMiddleware, validatePhoneMiddleware, validateRequiredFields } from "../../middleware/validation.js";

const router = express.Router();

/**
 * Unified User Routes
 * Supports all user types: expert (speaker/trainer), organiser, participant
 * Routes are prefixed with /api/user/:userType
 */

// ============================================
// OTP Routes (Public)
// ============================================

/**
 * @route   POST /api/user/:userType/send-email-otp
 * @desc    Send OTP to email for verification
 * @access  Public
 */
router.post("/:userType/send-email-otp", validateEmailMiddleware, sendEmailOtpController);

/**
 * @route   POST /api/user/:userType/verify-email-otp
 * @desc    Verify email OTP
 * @access  Public
 */
router.post("/:userType/verify-email-otp", validateRequiredFields(['email', 'otp']), verifyEmailOtpController);

/**
 * @route   POST /api/user/:userType/send-phone-otp
 * @desc    Send OTP to phone for verification (expert only)
 * @access  Public
 */
router.post("/:userType/send-phone-otp", validatePhoneMiddleware, sendPhoneOtpController);

/**
 * @route   POST /api/user/:userType/verify-phone-otp
 * @desc    Verify phone OTP (expert only)
 * @access  Public
 */
router.post("/:userType/verify-phone-otp", validateRequiredFields(['phoneNumber', 'otp']), verifyPhoneOtpController);

/**
 * @route   POST /api/user/:userType/resend-otp
 * @desc    Resend OTP (email or phone)
 * @access  Public
 */
router.post("/:userType/resend-otp", validateRequiredFields(['identifier', 'type']), resendOtpController);

// ============================================
// Registration Routes (Public)
// ============================================

/**
 * @route   POST /api/user/:userType/register
 * @desc    Complete user registration
 * @access  Public
 */
router.post("/:userType/register", registerUserController);

/**
 * @route   GET /api/user/:userType/check-email/:email
 * @desc    Check if email is available
 * @access  Public
 */
router.get("/:userType/check-email/:email", checkEmailController);

/**
 * @route   GET /api/user/:userType/check-phone/:phoneNumber
 * @desc    Check if phone number is available
 * @access  Public
 */
router.get("/:userType/check-phone/:phoneNumber", checkPhoneController);

// ============================================
// Authentication Routes
// ============================================

/**
 * @route   POST /api/user/login
 * @desc    Unified login - determines user type from role
 * @access  Public
 */
router.post("/login", validateRequiredFields(['email', 'password']), unifiedLoginController);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user (direct route without userType)
 * @access  Private
 */
router.get("/me", authenticateUser, getCurrentUserController);

/**
 * @route   GET /api/user/:userType/me
 * @desc    Get current user
 * @access  Private
 */
router.get("/:userType/me", authenticateUser, getCurrentUserController);

/**
 * @route   POST /api/user/:userType/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/:userType/logout", authenticateUser, logoutUserController);

/**
 * @route   POST /api/user/:userType/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/:userType/refresh-token", refreshTokenController);

/**
 * @route   GET /api/user/:userType/status
 * @desc    Check authentication status
 * @access  Private (uses middleware to check auth)
 */
router.get("/:userType/status", authenticateUser, checkAuthStatusController);

export default router;

