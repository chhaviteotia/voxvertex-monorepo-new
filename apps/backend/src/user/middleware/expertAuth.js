import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.utils.js';
import { generateTokenPair } from '../utils/jwt.utils.js';
import { setAllAuthCookies } from '../utils/cookie.utils.js';
import { getExpertByEmail } from '../services/expert.service.js';

/**
 * JWT Authentication Middleware for Expert Users
 * Verifies JWT token and attaches user to request object
 */
export const authenticateExpertJWT = async (req, res, next) => {
  try {
    // Get token from header or cookies
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.expertAccessToken;

    if (!token) {
      // Try refresh token if access token is not available
      const refreshToken = req.cookies?.expertRefreshToken;
      
      if (refreshToken) {
        try {
          const refreshDecoded = verifyRefreshToken(refreshToken);
          const user = await getExpertByEmail(refreshDecoded.email);
          
          if (!user) {
            return res.status(401).json({
              success: false,
              message: 'Expert user not found'
            });
          }
          
          // Generate new token pair
          const newTokens = generateTokenPair(user);
          
          // Set new cookies
          setAllAuthCookies(res, newTokens, user);
          
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
            message: 'Session expired. Please login again.',
            error: 'SESSION_EXPIRED'
          });
        }
      }
      
      return res.status(401).json({
        success: false,
        message: 'Authentication required - No token provided'
      });
    }

    try {
      // Verify access token
      const decoded = verifyAccessToken(token);
      
      // Attach user info to request
      req.user = { 
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role,
        email: decoded.email
      };
      
      next();
    } catch (tokenError) {
      // Access token expired, try refresh token
      const refreshToken = req.cookies?.expertRefreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please login again.',
          error: 'SESSION_EXPIRED'
        });
      }
      
      try {
        const refreshDecoded = verifyRefreshToken(refreshToken);
        const user = await getExpertByEmail(refreshDecoded.email);
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Expert user not found'
          });
        }
        
        // Generate new token pair
        const newTokens = generateTokenPair(user);
        
        // Set new cookies
        setAllAuthCookies(res, newTokens, user);
        
        // Attach user info to request
        req.user = { 
          _id: user._id,
          id: user._id,
          role: user.role,
          email: user.email
        };
        
        req.tokenRefreshed = true;
        next();
      } catch (refreshError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid session. Please login again.',
          error: 'INVALID_SESSION'
        });
      }
    }
  } catch (error) {
    console.error('Expert auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication system error'
    });
  }
};

/**
 * Role-based authorization middleware for experts
 * Checks if user has one of the required roles
 * @param {...String} roles - Required roles (speaker, trainer)
 */
export const authorizeExpertRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    if (!userRole || typeof userRole !== 'string') {
      return res.status(401).json({
        success: false,
        message: 'Invalid user role'
      });
    }
    
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedRoles = roles.map(role => typeof role === 'string' ? role.toLowerCase() : String(role).toLowerCase());
    
    if (!normalizedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

