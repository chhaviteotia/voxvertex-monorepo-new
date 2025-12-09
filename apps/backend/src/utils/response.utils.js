/**
 * Response Utilities
 * Standardized API response helpers for consistent response format
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} error - Error details (only in development)
 */
export const sendError = (res, message = 'Internal server error', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message,
  };

  // Only include error details in development
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error instanceof Error ? error.message : error;
    if (error instanceof Error && error.stack) {
      response.stack = error.stack;
    }
  }

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {string|Array} errors - Validation error message(s)
 * @param {number} statusCode - HTTP status code (default: 400)
 */
export const sendValidationError = (res, errors, statusCode = 400) => {
  const response = {
    success: false,
    message: 'Validation failed',
    errors: Array.isArray(errors) ? errors : [errors],
  };

  return res.status(statusCode).json(response);
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Resource not found')
 */
export const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Unauthorized')
 */
export const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, message, 401);
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Forbidden')
 */
export const sendForbidden = (res, message = 'Forbidden') => {
  return sendError(res, message, 403);
};


