import 'dotenv/config';

/**
 * Cookie Utilities - Shared across all user types
 * Handles setting and clearing authentication cookies
 */

// Detect production environment
const isProd = process.env.NODE_ENV === 'production';
const isHttps = process.env.NODE_ENV === 'production';

/**
 * Cookie configuration for different environments
 */
const getCookieConfig = (maxAge, httpOnly = true) => ({
  httpOnly,
  secure: isHttps,
  sameSite: isProd ? "none" : "lax",
  maxAge,
  path: '/',
});

/**
 * Set refresh token cookie (7 days)
 * @param {Object} res - Express response object
 * @param {String} token - Refresh token
 * @param {String} userType - Type of user (expert, organiser, participant)
 */
export const setRefreshTokenCookie = (res, token, userType = 'expert') => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  res.cookie(`${userType}RefreshToken`, token, getCookieConfig(maxAge));
};

/**
 * Set access token cookie (15 minutes) - NOT httpOnly for Socket.IO access
 * @param {Object} res - Express response object
 * @param {String} token - Access token
 * @param {String} userType - Type of user (expert, organiser, participant)
 */
export const setAccessTokenCookie = (res, token, userType = 'expert') => {
  const maxAge = 15 * 60 * 1000; // 15 minutes
  res.cookie(`${userType}AccessToken`, token, {
    httpOnly: false, // Allow JavaScript access for Socket.IO
    secure: isHttps,
    sameSite: isProd ? "none" : "lax",
    maxAge,
    path: '/',
  });
};

/**
 * Set user role cookie (non-httpOnly for client access)
 * @param {Object} res - Express response object
 * @param {String} role - User role
 * @param {String} userType - Type of user (expert, organiser, participant)
 */
export const setUserRoleCookie = (res, role, userType = 'expert') => {
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  res.cookie(`${userType}Role`, role, {
    httpOnly: false,
    secure: isHttps,
    sameSite: isProd ? "none" : "lax",
    maxAge,
    path: '/',
  });
};

/**
 * Set all authentication cookies including user role
 * @param {Object} res - Express response object
 * @param {Object} tokens - Object with accessToken and refreshToken
 * @param {Object} user - User object
 * @param {String} userType - Type of user (expert, organiser, participant)
 */
export const setAllAuthCookies = (res, tokens, user, userType = 'expert') => {
  setAccessTokenCookie(res, tokens.accessToken, userType);
  setRefreshTokenCookie(res, tokens.refreshToken, userType);
  if (user && user.role) {
    setUserRoleCookie(res, user.role, userType);
  }
};

/**
 * Clear authentication cookies
 * @param {Object} res - Express response object
 * @param {String} userType - Type of user (expert, organiser, participant)
 */
export const clearAuthCookies = (res, userType = 'expert') => {
  const clearConfig = {
    httpOnly: true,
    secure: isHttps,
    sameSite: isProd ? "none" : "lax",
    path: '/',
  };
  
  res.clearCookie(`${userType}AccessToken`, {
    httpOnly: false,
    secure: isHttps,
    sameSite: isProd ? "none" : "lax",
    path: '/',
  });
  res.clearCookie(`${userType}RefreshToken`, clearConfig);
  res.clearCookie(`${userType}Role`, {
    secure: isHttps,
    sameSite: isProd ? "none" : "lax",
    path: '/',
  });
};

