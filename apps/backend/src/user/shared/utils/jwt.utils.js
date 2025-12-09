import jwt from 'jsonwebtoken';
import 'dotenv/config';

/**
 * JWT Utilities - Shared across all user types
 * Generates and verifies JWT tokens for authentication
 */

// JWT Configuration
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate Access Token (short-lived)
 */
export const generateAccessToken = (payload) => {
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error('JWT_ACCESS_SECRET or JWT_SECRET is not configured');
  }
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { 
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'voxvertex',
    audience: 'voxvertex-users'
  });
};

/**
 * Generate Refresh Token (long-lived)
 */
export const generateRefreshToken = (payload) => {
  if (!REFRESH_TOKEN_SECRET) {
    throw new Error('JWT_REFRESH_SECRET or JWT_SECRET is not configured');
  }
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { 
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'voxvertex',
    audience: 'voxvertex-users'
  });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: 'voxvertex',
      audience: 'voxvertex-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'voxvertex',
      audience: 'voxvertex-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} user - User object
 * @param {String} userType - Type of user (expert, organiser, participant)
 */
export const generateTokenPair = (user, userType = 'expert') => {
  // Use fullName, fallback to email if not available
  const fullName = user.fullName || user.email || 'User';

  const payload = {
    id: user._id || user.id,
    email: user.email,
    role: user.role,
    userType: userType,
    fullName: fullName,
    emailVerified: user.emailVerified || false,
    phoneVerified: user.phoneVerified || false,
    registrationCompleted: user.registrationCompleted || false
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ 
    id: user._id || user.id, 
    email: user.email,
    userType: userType
  });

  return { accessToken, refreshToken };
};

/**
 * Decode token without verification (for expired tokens)
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

