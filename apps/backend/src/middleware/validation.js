/**
 * Validation Middleware
 * Common validation functions for request data
 */

import { sendValidationError } from '../utils/response.utils.js';

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic validation - adjust regex as needed)
 */
export const validatePhone = (phone) => {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Check if it's a valid phone number (at least 10 digits)
  return /^\+?[1-9]\d{9,14}$/.test(cleaned);
};

/**
 * Middleware to validate email in request body
 */
export const validateEmailMiddleware = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return sendValidationError(res, 'Email is required');
  }

  if (!validateEmail(email)) {
    return sendValidationError(res, 'Invalid email format');
  }

  next();
};

/**
 * Middleware to validate phone in request body
 */
export const validatePhoneMiddleware = (req, res, next) => {
  const { phone, phoneNumber } = req.body;
  const phoneToValidate = phone || phoneNumber;

  if (!phoneToValidate) {
    return sendValidationError(res, 'Phone number is required');
  }

  if (!validatePhone(phoneToValidate)) {
    return sendValidationError(res, 'Invalid phone number format');
  }

  next();
};

/**
 * Middleware to validate required fields
 * @param {string[]} fields - Array of required field names
 */
export const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return sendValidationError(
        res,
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Middleware to validate ObjectId format
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName] || req.body[paramName] || req.query[paramName];

    if (!id) {
      return sendValidationError(res, `${paramName} is required`);
    }

    // MongoDB ObjectId is 24 hex characters
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return sendValidationError(res, `Invalid ${paramName} format`);
    }

    next();
  };
};


