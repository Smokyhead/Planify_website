const express = require("express");
const ExportController = require("../controllers/exportController");
const { authenticateToken } = require("../middleware/auth");
const { validateFields, validateNumeric } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

/**
 * @route POST /api/export/schedule
 * @desc Export schedule data
 * @access Private
 */
router.post(
  "/schedule",
  authenticateToken,
  validateFields(["week_number", "year"]),
  validateNumeric(["week_number", "year", "warehouse_id"]),
  asyncHandler(ExportController.exportSchedule)
);

/**
 * @route GET /api/export/optimization-runs
 * @desc Export optimization runs data
 * @access Private
 */
router.get(
  "/optimization-runs",
  authenticateToken,
  asyncHandler(ExportController.exportOptimizationRuns)
);

/**
 * @route GET /api/export/dashboard-stats
 * @desc Export dashboard statistics
 * @access Private
 */
router.get(
  "/dashboard-stats",
  authenticateToken,
  asyncHandler(ExportController.exportDashboardStats)
);

/**
 * @route GET /api/export/formats
 * @desc Get available export formats
 * @access Private
 */
router.get(
  "/formats",
  authenticateToken,
  asyncHandler(ExportController.getExportFormats)
);

module.exports = router;
