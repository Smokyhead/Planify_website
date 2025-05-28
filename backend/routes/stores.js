const express = require("express");
const StoreController = require("../controllers/storeController");
const { authenticateToken } = require("../middleware/auth");
const { validateFields, validateGPS, validateNumeric } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

/**
 * @route GET /api/stores
 * @desc Get all stores
 * @access Private
 */
router.get(
  "/",
  authenticateToken,
  asyncHandler(StoreController.getStores)
);

/**
 * @route GET /api/stores/:id
 * @desc Get single store by ID
 * @access Private
 */
router.get(
  "/:id",
  authenticateToken,
  asyncHandler(StoreController.getStore)
);

/**
 * @route POST /api/stores
 * @desc Create new store
 * @access Private
 */
router.post(
  "/",
  authenticateToken,
  validateFields(["code", "name", "address", "gps_lat", "gps_lng"]),
  validateGPS,
  validateNumeric(["unloading_time_minutes"]),
  asyncHandler(StoreController.createStore)
);

/**
 * @route PUT /api/stores/:id
 * @desc Update store
 * @access Private
 */
router.put(
  "/:id",
  authenticateToken,
  validateFields(["code", "name", "address", "gps_lat", "gps_lng"]),
  validateGPS,
  validateNumeric(["unloading_time_minutes"]),
  asyncHandler(StoreController.updateStore)
);

/**
 * @route DELETE /api/stores/:id
 * @desc Delete store (soft delete)
 * @access Private
 */
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(StoreController.deleteStore)
);

module.exports = router;
