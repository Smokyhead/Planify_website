const express = require("express");
const OptimizationController = require("../controllers/optimizationController");
const { authenticateToken } = require("../middleware/auth");
const { validateFields, validateNumeric } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

/**
 * @route POST /api/optimization/calculate-distances
 * @desc Calculate distances between warehouse and stores
 * @access Private
 */
router.post(
  "/calculate-distances",
  authenticateToken,
  validateFields(["warehouse_id", "store_ids"]),
  validateNumeric(["warehouse_id"]),
  asyncHandler(OptimizationController.calculateDistances)
);

/**
 * @route POST /api/optimization/generate-schedule
 * @desc Generate optimized delivery schedule
 * @access Private
 */
router.post(
  "/generate-schedule",
  authenticateToken,
  validateFields(["warehouse_id", "week_number", "year"]),
  validateNumeric(["warehouse_id", "week_number", "year", "max_daily_distance"]),
  asyncHandler(OptimizationController.generateSchedule)
);

/**
 * @route GET /api/optimization/runs
 * @desc Get optimization runs history
 * @access Private
 */
router.get(
  "/runs",
  authenticateToken,
  asyncHandler(OptimizationController.getOptimizationRuns)
);

/**
 * @route GET /api/optimization/schedules/:week/:year
 * @desc Get schedules for a specific week
 * @access Private
 */
router.get(
  "/schedules/:week/:year",
  authenticateToken,
  asyncHandler(OptimizationController.getSchedules)
);

/**
 * @route GET /api/optimization/test-schedule
 * @desc Test endpoint for schedule functionality
 * @access Private
 */
router.get(
  "/test-schedule",
  authenticateToken,
  asyncHandler(OptimizationController.testSchedule)
);

module.exports = router;
