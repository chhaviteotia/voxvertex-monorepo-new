import express from "express";
import {
  createAvailabilityController,
  getAvailabilitiesByMonthController,
  getAvailabilitiesByDateRangeController,
  getAvailabilityByIdController,
  updateAvailabilityController,
  deleteAvailabilityByDatesController,
  deleteAvailabilityByIdController,
} from "../controllers/availabilityController.js";
import { authenticateUser } from "../../user/middleware/userAuth.js";

const router = express.Router();

/**
 * Availability Routes
 * All routes require authentication
 * Routes are prefixed with /api/availability
 */

/**
 * @route   POST /api/availability
 * @desc    Create availability for one or more dates
 * @access  Private (Speaker only)
 * @body    dates, eventTypes, modes, timeSlots, notes
 */
router.post("/", authenticateUser, createAvailabilityController);

/**
 * @route   GET /api/availability/range
 * @desc    Get availabilities by date range
 * @access  Private
 * @query   startDate, endDate
 */
router.get("/range", authenticateUser, getAvailabilitiesByDateRangeController);

/**
 * @route   GET /api/availability/:year/:month
 * @desc    Get availabilities for a specific month
 * @access  Private
 * @note    This route must come before /:availabilityId to avoid conflicts
 */
router.get("/:year/:month", authenticateUser, getAvailabilitiesByMonthController);

/**
 * @route   GET /api/availability/:availabilityId
 * @desc    Get a single availability by ID
 * @access  Private
 * @note    This will only match if the param is a single value (not two values like year/month)
 */
router.get("/:availabilityId", authenticateUser, getAvailabilityByIdController);

/**
 * @route   PUT /api/availability/:availabilityId
 * @desc    Update availability
 * @access  Private
 * @body    eventTypes, modes, timeSlots, notes
 */
router.put("/:availabilityId", authenticateUser, updateAvailabilityController);

/**
 * @route   DELETE /api/availability
 * @desc    Delete availability by dates
 * @access  Private
 * @body    dates (array)
 */
router.delete("/", authenticateUser, deleteAvailabilityByDatesController);

/**
 * @route   DELETE /api/availability/:availabilityId
 * @desc    Delete a single availability by ID
 * @access  Private
 */
router.delete("/:availabilityId", authenticateUser, deleteAvailabilityByIdController);

export default router;

