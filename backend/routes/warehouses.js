const express = require("express");
const WarehouseController = require("../controllers/warehouseController");
const { authenticateToken } = require("../middleware/auth");
const { validateFields, validateGPS, validateNumeric } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

/**
 * @route GET /api/warehouses
 * @desc Get all warehouses
 * @access Private
 */
router.get(
  "/",
  authenticateToken,
  asyncHandler(WarehouseController.getWarehouses)
);

/**
 * @route GET /api/warehouses/:id
 * @desc Get single warehouse by ID
 * @access Private
 */
router.get(
  "/:id",
  authenticateToken,
  asyncHandler(WarehouseController.getWarehouse)
);

/**
 * @route POST /api/warehouses
 * @desc Create new warehouse
 * @access Private
 */
router.post(
  "/",
  authenticateToken,
  validateFields(["code", "location", "capacity_km", "schedule"]),
  validateGPS,
  validateNumeric(["capacity_km"]),
  asyncHandler(WarehouseController.createWarehouse)
);

/**
 * @route PUT /api/warehouses/:id
 * @desc Update warehouse
 * @access Private
 */
router.put(
  "/:id",
  authenticateToken,
  validateFields(["code", "location", "capacity_km", "schedule"]),
  validateGPS,
  validateNumeric(["capacity_km"]),
  asyncHandler(WarehouseController.updateWarehouse)
);

/**
 * @route DELETE /api/warehouses/:id
 * @desc Delete warehouse (soft delete)
 * @access Private
 */
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(WarehouseController.deleteWarehouse)
);

module.exports = router;
