import { verifyAccessToken, verifyRefreshToken } from '../shared/utils/jwt.utils.js';
import { generateTokenPair } from '../shared/utils/jwt.utils.js';
import { setAllAuthCookies } from '../shared/utils/cookie.utils.js';
import { getUserByEmail } from '../services/user.service.js';

/**
 * Unified User Authentication Middleware
 * Works for all user types: expert (speaker/trainer), organiser, participant
 * Verifies JWT token and attaches user to request object
 */
export const authenticateUser = async (req, res, next) => {
  try {
    // Extract userType from route params (if available)
    const userType = req.params.userType || 'expert';
    
    // Get token from header first (works for all user types)
    // Try multiple methods to extract Authorization header
    let token = req.header('Authorization') || 
                req.headers['authorization'] || 
                req.headers['Authorization'];
    
    // Remove 'Bearer ' prefix if present
    if (token) {
      token = token.replace(/^Bearer\s+/i, '').trim();
      // If token is the string "null" or "undefined", treat it as no token
      if (token === 'null' || token === 'undefined' || token === '') {
        token = null;
      }
    }
    
    // If no header token, try cookies - check all possible user types
    if (!token) {
      token = req.cookies?.[`${userType}AccessToken`] ||
              req.cookies?.expertAccessToken ||
              req.cookies?.organiserAccessToken ||
              req.cookies?.participantAccessToken ||
              req.cookies?.accessToken;
    }

    if (!token) {
      // Try refresh token if access token is not available
      const refreshToken = req.cookies?.[`${userType}RefreshToken`] ||
                          req.cookies?.expertRefreshToken ||
                          req.cookies?.organiserRefreshToken ||
                          req.cookies?.participantRefreshToken ||
                          req.cookies?.refreshToken;
      
      if (refreshToken) {
        try {
          const refreshDecoded = verifyRefreshToken(refreshToken);
          const user = await getUserByEmail(refreshDecoded.email);
          
          if (!user) {
            return res.status(401).json({
              success: false,
              message: 'User not found'
            });
          }
          
          // Generate new token pair
          const newTokens = generateTokenPair(user, userType);
          
          // Set new cookies
          setAllAuthCookies(res, newTokens, user, userType);
          
          // Attach user info to request
          req.user = { 
            _id: user._id,
            id: user._id,
            role: user.role,
            email: user.email
          };
          
          req.tokenRefreshed = true;
          return next();
        } catch (refreshError) {
          return res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token'
          });
        }
      }
      
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    // Verify access token
    try {
      const decoded = verifyAccessToken(token);
      
      if (!decoded || !decoded.email) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format'
        });
      }
      
      // Get user from database
      const user = await getUserByEmail(decoded.email);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify user type matches (if specified in route and not default)
      // Only check if userType is explicitly in params (not default 'expert')
      if (req.params.userType) {
        if (userType === 'expert' && !["speaker", "trainer"].includes(user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Invalid user type for this endpoint'
          });
        }
        if (userType === 'organiser' && user.role !== 'organiser') {
          return res.status(403).json({
            success: false,
            message: 'Invalid user type for this endpoint'
          });
        }
        if (userType === 'participant' && user.role !== 'participant') {
          return res.status(403).json({
            success: false,
            message: 'Invalid user type for this endpoint'
          });
        }
      }

      // Attach user to request
      req.user = {
        _id: user._id,
        id: user._id,
        role: user.role,
        email: user.email,
        fullName: user.fullName
      };
      
      next();
    } catch (tokenError) {
      console.error('Token verification error:', tokenError.message);
      // Provide more specific error messages
      const errorMessage = tokenError.message || 'Invalid or expired token';
      return res.status(401).json({
        success: false,
        message: errorMessage.includes('expired') ? 'Token has expired. Please login again.' : 
                 errorMessage.includes('invalid') ? 'Invalid token. Please login again.' :
                 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

