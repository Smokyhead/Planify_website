const AuthService = require("../services/authService");
const Logger = require("../utils/logger");
const { createApiResponse } = require("../utils/helpers");

class AuthController {
  /**
   * User login
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);
      
      res.json(createApiResponse(true, {
        token: result.token,
        user: result.user
      }, "Login successful"));

    } catch (error) {
      Logger.error("Login controller error", { error: error.message, email: req.body.email });
      
      if (error.message === "Invalid credentials") {
        return res.status(401).json(createApiResponse(false, null, null, "Invalid credentials"));
      }
      
      res.status(500).json(createApiResponse(false, null, null, "Login failed"));
    }
  }

  /**
   * Get user profile
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getProfile(req, res) {
    try {
      const profile = await AuthService.getProfile(req.user.id);
      res.json(createApiResponse(true, profile));
    } catch (error) {
      Logger.error("Get profile controller error", { error: error.message, userId: req.user.id });
      
      if (error.message === "User not found") {
        return res.status(404).json(createApiResponse(false, null, null, "User not found"));
      }
      
      res.status(500).json(createApiResponse(false, null, null, "Failed to get profile"));
    }
  }

  /**
   * Update user profile
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async updateProfile(req, res) {
    try {
      const { name, email, phone, department, role } = req.body;
      
      const updatedProfile = await AuthService.updateProfile(req.user.id, {
        name, email, phone, department, role
      });
      
      res.json(createApiResponse(true, {
        user: updatedProfile
      }, "Profile updated successfully"));

    } catch (error) {
      Logger.error("Update profile controller error", { error: error.message, userId: req.user.id });
      
      if (error.message === "Email already exists") {
        return res.status(400).json(createApiResponse(false, null, null, "Email already exists"));
      }
      
      if (error.message === "User not found") {
        return res.status(404).json(createApiResponse(false, null, null, "User not found"));
      }
      
      res.status(500).json(createApiResponse(false, null, null, "Failed to update profile"));
    }
  }

  /**
   * Change user password
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      
      res.json(createApiResponse(true, null, "Password updated successfully"));

    } catch (error) {
      Logger.error("Change password controller error", { error: error.message, userId: req.user.id });
      
      if (error.message === "Current password is incorrect") {
        return res.status(400).json(createApiResponse(false, null, null, "Current password is incorrect"));
      }
      
      if (error.message === "User not found") {
        return res.status(404).json(createApiResponse(false, null, null, "User not found"));
      }
      
      res.status(500).json(createApiResponse(false, null, null, "Failed to update password"));
    }
  }

  /**
   * Logout user (client-side token removal)
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async logout(req, res) {
    try {
      Logger.info("User logged out", { userId: req.user?.id });
      res.json(createApiResponse(true, null, "Logged out successfully"));
    } catch (error) {
      Logger.error("Logout controller error", error);
      res.status(500).json(createApiResponse(false, null, null, "Logout failed"));
    }
  }
}

module.exports = AuthController;
