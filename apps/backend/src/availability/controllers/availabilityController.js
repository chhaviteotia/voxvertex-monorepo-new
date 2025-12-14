import {
  createAvailability,
  getAvailabilitiesByMonth,
  getAvailabilitiesByDateRange,
  getAvailabilityById,
  updateAvailability,
  deleteAvailabilityByDates,
  deleteAvailabilityById,
} from "../services/availability.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../../utils/response.utils.js";

/**
 * Availability Controller
 * Handles HTTP requests for availability operations
 */

/**
 * Create availability for one or more dates
 * POST /api/availability
 */
export const createAvailabilityController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  // Verify user is a speaker
  const userRole = req.user?.role;
  if (userRole !== "speaker") {
    return sendError(res, "Only speakers can set availability", 403);
  }

  const { dates, eventTypes, modes, timeSlots, notes } = req.body;

  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return sendError(res, "At least one date is required", 400);
  }

  if (!eventTypes || eventTypes.length === 0) {
    return sendError(res, "At least one event type is required", 400);
  }

  if (!modes || modes.length === 0) {
    return sendError(res, "At least one delivery mode is required", 400);
  }

  if (!timeSlots || timeSlots.length === 0) {
    return sendError(res, "At least one time slot is required", 400);
  }

  try {
    const availabilities = await createAvailability(userId, {
      dates,
      eventTypes,
      modes,
      timeSlots,
      notes,
    });

    return sendSuccess(
      res,
      {
        availabilities,
        count: availabilities.length,
      },
      `Availability created for ${availabilities.length} date(s)`,
      201
    );
  } catch (error) {
    return sendError(res, error.message || "Failed to create availability", 400);
  }
});

/**
 * Get availabilities for a specific month
 * GET /api/availability/:year/:month
 */
export const getAvailabilitiesByMonthController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const { year, month } = req.params;

    if (!year || !month) {
      return sendError(res, "Year and month are required", 400);
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return sendError(res, "Invalid year or month", 400);
    }

    try {
      const availabilities = await getAvailabilitiesByMonth(
        userId,
        yearNum,
        monthNum
      );

      return sendSuccess(
        res,
        availabilities,
        "Availabilities retrieved successfully"
      );
    } catch (error) {
      return sendError(
        res,
        error.message || "Failed to retrieve availabilities",
        400
      );
    }
  }
);

/**
 * Get availabilities by date range
 * GET /api/availability/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getAvailabilitiesByDateRangeController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return sendError(res, "Start date and end date are required", 400);
    }

    try {
      const availabilities = await getAvailabilitiesByDateRange(
        userId,
        startDate,
        endDate
      );

      return sendSuccess(
        res,
        availabilities,
        "Availabilities retrieved successfully"
      );
    } catch (error) {
      return sendError(
        res,
        error.message || "Failed to retrieve availabilities",
        400
      );
    }
  }
);

/**
 * Get a single availability by ID
 * GET /api/availability/:availabilityId
 */
export const getAvailabilityByIdController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { availabilityId } = req.params;

  if (!availabilityId) {
    return sendError(res, "Availability ID is required", 400);
  }

  try {
    const availability = await getAvailabilityById(availabilityId);

    // Verify the availability belongs to the current user
    const availabilitySpeakerId = availability.speaker?.toString() || availability.speaker;
    const currentUserId = userId.toString();
    
    if (availabilitySpeakerId !== currentUserId) {
      return sendError(res, "Unauthorized access to this availability", 403);
    }

    return sendSuccess(
      res,
      availability,
      "Availability retrieved successfully"
    );
  } catch (error) {
    return sendError(
      res,
      error.message || "Failed to retrieve availability",
      400
    );
  }
});

/**
 * Update availability
 * PUT /api/availability/:availabilityId
 */
export const updateAvailabilityController = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    return sendError(res, "User not authenticated", 401);
  }

  const { availabilityId } = req.params;
  const { eventTypes, modes, timeSlots, notes } = req.body;

  if (!availabilityId) {
    return sendError(res, "Availability ID is required", 400);
  }

  try {
    // First check if availability exists and belongs to user
    const existing = await getAvailabilityById(availabilityId);
    const availabilitySpeakerId = existing.speaker?.toString() || existing.speaker;
    const currentUserId = userId.toString();
    
    if (availabilitySpeakerId !== currentUserId) {
      return sendError(res, "Unauthorized access to this availability", 403);
    }

    const availability = await updateAvailability(availabilityId, {
      eventTypes,
      modes,
      timeSlots,
      notes,
    });

    return sendSuccess(
      res,
      availability,
      "Availability updated successfully"
    );
  } catch (error) {
    return sendError(
      res,
      error.message || "Failed to update availability",
      400
    );
  }
});

/**
 * Delete availability by dates
 * DELETE /api/availability
 */
export const deleteAvailabilityByDatesController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const { dates } = req.body;

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return sendError(res, "At least one date is required", 400);
    }

    try {
      const deletedCount = await deleteAvailabilityByDates(userId, dates);

      return sendSuccess(
        res,
        { deletedCount },
        `Deleted ${deletedCount} availability record(s)`
      );
    } catch (error) {
      return sendError(
        res,
        error.message || "Failed to delete availability",
        400
      );
    }
  }
);

/**
 * Delete a single availability by ID
 * DELETE /api/availability/:availabilityId
 */
export const deleteAvailabilityByIdController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const { availabilityId } = req.params;

    if (!availabilityId) {
      return sendError(res, "Availability ID is required", 400);
    }

    try {
      // First check if availability exists and belongs to user
      const existing = await getAvailabilityById(availabilityId);
      const availabilitySpeakerId = existing.speaker?.toString() || existing.speaker;
      const currentUserId = userId.toString();
      
      if (availabilitySpeakerId !== currentUserId) {
        return sendError(res, "Unauthorized access to this availability", 403);
      }

      await deleteAvailabilityById(availabilityId);

      return sendSuccess(res, null, "Availability deleted successfully");
    } catch (error) {
      return sendError(
        res,
        error.message || "Failed to delete availability",
        400
      );
    }
  }
);

