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
      industry,
      country,
      city,
      limit = 50,
      skip = 0,
    } = req.query;

    const filters = {
      search,
      role,
      industry,
      country,
      city,
      limit: parseInt(limit),
      skip: parseInt(skip),
    };

    const experts = await getAllExperts(filters);
    const total = await getExpertCount(filters);

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

