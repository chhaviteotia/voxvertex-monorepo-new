import express from "express";
import { getExpertsController, getExpertByIdController } from "../controllers/marketplaceController.js";

const router = express.Router();

/**
 * Marketplace Routes
 * Public routes for browsing experts
 */

/**
 * @route   GET /api/marketplace/experts
 * @desc    Get all experts (speakers and trainers) for marketplace
 * @access  Public
 * @query   search, role, industry, country, city, limit, skip
 */
router.get("/experts", getExpertsController);

/**
 * @route   GET /api/marketplace/experts/:id
 * @desc    Get a single expert by ID
 * @access  Public
 */
router.get("/experts/:id", getExpertByIdController);

export default router;

