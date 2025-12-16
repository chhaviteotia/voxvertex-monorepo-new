import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../../utils/response.utils.js";
import { getAllExperts, getExpertCount, getExpertById } from "../services/marketplace.service.js";

/**
 * Get all experts for marketplace
 * GET /api/marketplace/experts
 */
export const getExpertsController = asyncHandler(async (req, res) => {
  try {
    const {
      search,
      role,
      roles, // Array of roles (comma-separated or array)
      industry,
      industries, // Array of industries (comma-separated or array)
      expertise, // Array of expertise (comma-separated or array)
      sessionTypes, // Array of session types (comma-separated or array)
      sessionFormats, // Array of session formats (comma-separated or array)
      sessionDurations, // Array of session durations (comma-separated or array)
      audienceTypes, // Array of audience types (comma-separated or array)
      languages, // Array of languages (comma-separated or array)
      availability, // Array of availability options (comma-separated or array)
      ratings, // Array of ratings (comma-separated or array)
      experienceLevels, // Array of experience levels (comma-separated or array)
      verificationStatus, // Array of verification statuses (comma-separated or array)
      priceMin,
      priceMax,
      country,
      city,
      limit = 50,
      skip = 0,
    } = req.query;

    // Helper function to parse array from query (supports both comma-separated strings and arrays)
    const parseArray = (value) => {
      if (!value) return undefined;
      if (Array.isArray(value)) return value;
      if (typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
      return [value];
    };

    const filters = {
      search,
      role, // Backward compatibility
      roles: parseArray(roles) || (role ? [role] : undefined),
      industry, // Backward compatibility
      industries: parseArray(industries) || (industry ? [industry] : undefined),
      expertise: parseArray(expertise),
      sessionTypes: parseArray(sessionTypes),
      sessionFormats: parseArray(sessionFormats),
      sessionDurations: parseArray(sessionDurations),
      audienceTypes: parseArray(audienceTypes),
      languages: parseArray(languages),
      availability: parseArray(availability),
      ratings: parseArray(ratings),
      experienceLevels: parseArray(experienceLevels),
      verificationStatus: parseArray(verificationStatus),
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      country,
      city,
      limit: parseInt(limit),
      skip: parseInt(skip),
    };

    const experts = await getAllExperts(filters);
    // For count, use simpler filters (without complex profile-based filters)
    const countFilters = {
      search,
      role,
      industry,
      country,
      city,
    };
    const total = await getExpertCount(countFilters);

    return sendSuccess(
      res,
      {
        experts,
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
      "Experts fetched successfully"
    );
  } catch (error) {
    return sendError(res, error.message || "Failed to fetch experts", 500);
  }
});

/**
 * Get a single expert by ID
 * GET /api/marketplace/experts/:id
 */
export const getExpertByIdController = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, "Expert ID is required", 400);
    }

    const expert = await getExpertById(id);

    if (!expert) {
      return sendError(res, "Expert not found", 404);
    }

    return sendSuccess(res, { expert }, "Expert fetched successfully");
  } catch (error) {
    return sendError(res, error.message || "Failed to fetch expert", 500);
  }
});

