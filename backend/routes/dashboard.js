const express = require("express");
const DashboardController = require("../controllers/dashboardController");
const { authenticateToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

/**
 * @route GET /api/dashboard/stats
 * @desc Get dashboard statistics
 * @access Private
 */
router.get(
  "/stats",
  authenticateToken,
  asyncHandler(DashboardController.getDashboardStats)
);

/**
 * @route GET /api/dashboard/warehouse/:warehouseId/metrics
 * @desc Get warehouse performance metrics
 * @access Private
 */
router.get(
  "/warehouse/:warehouseId/metrics",
  authenticateToken,
  asyncHandler(DashboardController.getWarehouseMetrics)
);

/**
 * @route GET /api/dashboard/delivery-trends
 * @desc Get delivery trends
 * @access Private
 */
router.get(
  "/delivery-trends",
  authenticateToken,
  asyncHandler(DashboardController.getDeliveryTrends)
);

/**
 * @route GET /api/dashboard/health
 * @desc Get system health status
 * @access Private
 */
router.get(
  "/health",
  authenticateToken,
  asyncHandler(DashboardController.getSystemHealth)
);

module.exports = router;
