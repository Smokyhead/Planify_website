const express = require("express");
const ContractController = require("../controllers/contractController");
const { authenticateToken } = require("../middleware/auth");
const { validateFields, validateNumeric } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

/**
 * @route GET /api/contracts
 * @desc Get all contracts
 * @access Private
 */
router.get(
  "/",
  authenticateToken,
  asyncHandler(ContractController.getContracts)
);

/**
 * @route GET /api/contracts/:id
 * @desc Get single contract by ID
 * @access Private
 */
router.get(
  "/:id",
  authenticateToken,
  asyncHandler(ContractController.getContract)
);

/**
 * @route POST /api/contracts
 * @desc Create new contract
 * @access Private
 */
router.post(
  "/",
  authenticateToken,
  validateFields(["store_id", "contract_type", "frequency_per_week"]),
  validateNumeric(["store_id", "frequency_per_week"]),
  asyncHandler(ContractController.createContract)
);

/**
 * @route PUT /api/contracts/:id
 * @desc Update contract
 * @access Private
 */
router.put(
  "/:id",
  authenticateToken,
  validateFields(["store_id", "contract_type", "frequency_per_week"]),
  validateNumeric(["store_id", "frequency_per_week"]),
  asyncHandler(ContractController.updateContract)
);

/**
 * @route DELETE /api/contracts/:id
 * @desc Delete contract (soft delete)
 * @access Private
 */
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(ContractController.deleteContract)
);

module.exports = router;
