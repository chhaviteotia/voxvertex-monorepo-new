/**
 * Centralized Error Handling Middleware
 * Handles all errors in a consistent way across the application
 */

import { sendError } from '../utils/response.utils.js';

/**
 * Custom Error Class for application-specific errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * Must be used after all routes
 */
export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);
  if (err.stack) {
    console.error('Stack:', err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map((error) => error.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validationErrors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Custom AppError
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err);
  }

  // Database connection errors
  if (err.message && (err.message.includes('not connected') || err.message.includes('buffering timed out'))) {
    return res.status(503).json({
      success: false,
      message: 'Database connection error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Handle errors with statusCode property (from verifyCredentials, etc.)
  if (err.statusCode) {
    const statusCode = err.statusCode;
    const message = err.message || 'An error occurred';
    return res.status(statusCode).json({
      success: false,
      message: message,
    });
  }

  // Default error
  const statusCode = err.status || 500;
  return sendError(res, err.message || 'Internal server error', statusCode, err);
};

/**
 * 404 Not Found handler
 * Must be used after all routes but before error handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

