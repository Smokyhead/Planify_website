const express = require("express");
const AuthController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const { validateFields, validateEmail, validatePassword } = require("../middleware/validation");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post(
  "/login",
  validateFields(["email", "password"]),
  validateEmail,
  asyncHandler(AuthController.login)
);

/**
 * @route GET /api/auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get(
  "/profile",
  authenticateToken,
  asyncHandler(AuthController.getProfile)
);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put(
  "/profile",
  authenticateToken,
  validateFields(["name", "email"]),
  validateEmail,
  asyncHandler(AuthController.updateProfile)
);

/**
 * @route PUT /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put(
  "/change-password",
  authenticateToken,
  validateFields(["currentPassword", "newPassword"]),
  validatePassword,
  asyncHandler(AuthController.changePassword)
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post(
  "/logout",
  authenticateToken,
  asyncHandler(AuthController.logout)
);

module.exports = router;
