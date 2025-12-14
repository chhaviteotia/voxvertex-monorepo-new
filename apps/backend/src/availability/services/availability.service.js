import Availability from "../models/availability.js";
import { normalizeId, isValidId } from "../../utils/db/idUtils.js";

/**
 * Availability Service
 * Business logic for availability operations
 */

/**
 * Create availability for one or more dates
 * @param {string} speakerId - Speaker user ID
 * @param {Object} availabilityData - Availability data
 * @param {string[]} availabilityData.dates - Array of date strings (YYYY-MM-DD)
 * @param {Array} availabilityData.eventTypes - Event types with pricing
 * @param {string[]} availabilityData.modes - Delivery modes
 * @param {Array} availabilityData.timeSlots - Time slots
 * @returns {Promise<Object>} Created availability documents
 */
export const createAvailability = async (speakerId, availabilityData) => {
  const { dates, eventTypes, modes, timeSlots, notes } = availabilityData;

  if (!isValidId(speakerId)) {
    throw new Error("Invalid speaker ID");
  }

  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    throw new Error("At least one date is required");
  }

  if (!eventTypes || eventTypes.length === 0) {
    throw new Error("At least one event type is required");
  }

  if (!modes || modes.length === 0) {
    throw new Error("At least one delivery mode is required");
  }

  if (!timeSlots || timeSlots.length === 0) {
    throw new Error("At least one time slot is required");
  }

  const normalizedSpeakerId = normalizeId(speakerId);
  const createdAvailabilities = [];

  // Create a separate availability document for each date
  for (const date of dates) {
    // Check if availability already exists for this date
    const existing = await Availability.findOne({
      speaker: normalizedSpeakerId,
      date: date,
    });

    if (existing) {
      // Update existing availability
      existing.eventTypes = eventTypes;
      existing.modes = modes;
      existing.timeSlots = timeSlots;
      if (notes !== undefined) {
        existing.notes = notes;
      }
      await existing.save();
      createdAvailabilities.push(existing);
    } else {
      // Create new availability
      const availability = new Availability({
        speaker: normalizedSpeakerId,
        date: date,
        eventTypes: eventTypes,
        modes: modes,
        timeSlots: timeSlots,
        notes: notes || null,
      });
      await availability.save();
      createdAvailabilities.push(availability);
    }
  }

  return createdAvailabilities;
};

/**
 * Get availabilities for a specific month
 * @param {string} speakerId - Speaker user ID
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Promise<Array>} Availability documents
 */
export const getAvailabilitiesByMonth = async (speakerId, year, month) => {
  if (!isValidId(speakerId)) {
    throw new Error("Invalid speaker ID");
  }

  // Create date range for the month
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  const normalizedSpeakerId = normalizeId(speakerId);

  const availabilities = await Availability.find({
    speaker: normalizedSpeakerId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ date: 1 })
    .lean();

  return availabilities;
};

/**
 * Get availabilities by date range
 * @param {string} speakerId - Speaker user ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Availability documents
 */
export const getAvailabilitiesByDateRange = async (
  speakerId,
  startDate,
  endDate
) => {
  if (!isValidId(speakerId)) {
    throw new Error("Invalid speaker ID");
  }

  const normalizedSpeakerId = normalizeId(speakerId);

  const availabilities = await Availability.find({
    speaker: normalizedSpeakerId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ date: 1 })
    .lean();

  return availabilities;
};

/**
 * Get a single availability by ID
 * @param {string} availabilityId - Availability ID
 * @returns {Promise<Object>} Availability document
 */
export const getAvailabilityById = async (availabilityId) => {
  if (!isValidId(availabilityId)) {
    throw new Error("Invalid availability ID");
  }

  const availability = await Availability.findById(
    normalizeId(availabilityId)
  ).lean();

  if (!availability) {
    throw new Error("Availability not found");
  }

  return availability;
};

/**
 * Update availability
 * @param {string} availabilityId - Availability ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated availability document
 */
export const updateAvailability = async (availabilityId, updateData) => {
  if (!isValidId(availabilityId)) {
    throw new Error("Invalid availability ID");
  }

  const availability = await Availability.findById(normalizeId(availabilityId));

  if (!availability) {
    throw new Error("Availability not found");
  }

  // Update fields
  if (updateData.eventTypes !== undefined) {
    availability.eventTypes = updateData.eventTypes;
  }
  if (updateData.modes !== undefined) {
    availability.modes = updateData.modes;
  }
  if (updateData.timeSlots !== undefined) {
    availability.timeSlots = updateData.timeSlots;
  }
  if (updateData.notes !== undefined) {
    availability.notes = updateData.notes;
  }

  await availability.save();
  return availability;
};

/**
 * Delete availability by dates
 * @param {string} speakerId - Speaker user ID
 * @param {string[]} dates - Array of date strings (YYYY-MM-DD)
 * @returns {Promise<number>} Number of deleted documents
 */
export const deleteAvailabilityByDates = async (speakerId, dates) => {
  if (!isValidId(speakerId)) {
    throw new Error("Invalid speaker ID");
  }

  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    throw new Error("At least one date is required");
  }

  const normalizedSpeakerId = normalizeId(speakerId);

  const result = await Availability.deleteMany({
    speaker: normalizedSpeakerId,
    date: { $in: dates },
  });

  return result.deletedCount;
};

/**
 * Delete a single availability by ID
 * @param {string} availabilityId - Availability ID
 * @returns {Promise<Object>} Deleted availability document
 */
export const deleteAvailabilityById = async (availabilityId) => {
  if (!isValidId(availabilityId)) {
    throw new Error("Invalid availability ID");
  }

  const availability = await Availability.findByIdAndDelete(
    normalizeId(availabilityId)
  );

  if (!availability) {
    throw new Error("Availability not found");
  }

  return availability;
};

