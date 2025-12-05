import express from "express";
import {
  sendEmailOtpController,
  verifyEmailOtpController,
  sendPhoneOtpController,
  verifyPhoneOtpController,
  resendOtpController,
  registerExpertController,
  checkEmailController,
  checkPhoneController,
  loginExpertController,
  getCurrentExpertController,
  logoutExpertController,
  refreshExpertTokenController,
  checkExpertAuthStatusController,
} from "../controllers/expertController.js";
import { authenticateExpertJWT } from "../middleware/expertAuth.js";

const router = express.Router();

/**
 * Expert Registration Routes
 * All routes are public (no authentication required)
 */

/**
 * @route   POST /api/user/expert/send-email-otp
 * @desc    Send OTP to email for verification
 * @access  Public
 */
router.post("/send-email-otp", sendEmailOtpController);

/**
 * @route   POST /api/user/expert/verify-email-otp
 * @desc    Verify email OTP
 * @access  Public
 */
router.post("/verify-email-otp", verifyEmailOtpController);

/**
 * @route   POST /api/user/expert/send-phone-otp
 * @desc    Send OTP to phone for verification
 * @access  Public
 */
router.post("/send-phone-otp", sendPhoneOtpController);

/**
 * @route   POST /api/user/expert/verify-phone-otp
 * @desc    Verify phone OTP
 * @access  Public
 */
router.post("/verify-phone-otp", verifyPhoneOtpController);

/**
 * @route   POST /api/user/expert/resend-otp
 * @desc    Resend OTP (email or phone)
 * @access  Public
 */
router.post("/resend-otp", resendOtpController);

/**
 * @route   POST /api/user/expert/register
 * @desc    Complete expert registration
 * @access  Public
 */
router.post("/register", registerExpertController);

/**
 * @route   GET /api/user/expert/check-email/:email
 * @desc    Check if email is available
 * @access  Public
 */
router.get("/check-email/:email", checkEmailController);

/**
 * @route   GET /api/user/expert/check-phone/:phoneNumber
 * @desc    Check if phone number is available
 * @access  Public
 */
router.get("/check-phone/:phoneNumber", checkPhoneController);

/**
 * @route   POST /api/user/expert/login
 * @desc    Login expert user
 * @access  Public
 */
router.post("/login", loginExpertController);

/**
 * @route   GET /api/user/expert/me
 * @desc    Get current expert user
 * @access  Private
 */
router.get("/me", authenticateExpertJWT, getCurrentExpertController);

/**
 * @route   POST /api/user/expert/logout
 * @desc    Logout expert user
 * @access  Private
 */
router.post("/logout", authenticateExpertJWT, logoutExpertController);

/**
 * @route   POST /api/user/expert/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh-token", refreshExpertTokenController);

/**
 * @route   GET /api/user/expert/status
 * @desc    Check authentication status
 * @access  Public (uses middleware to check auth)
 */
router.get("/status", authenticateExpertJWT, checkExpertAuthStatusController);

export default router;

