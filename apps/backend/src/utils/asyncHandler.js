/**
 * Async Handler Utility
 * Wraps async route handlers to automatically catch errors and pass them to error middleware
 * Eliminates the need for try-catch blocks in every controller
 * 
 * Usage:
 *   export const myController = asyncHandler(async (req, res, next) => {
 *     // Your async code here - no need for try-catch
 *     const result = await someAsyncOperation();
 *     res.json({ success: true, data: result });
 *   });
 */

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


