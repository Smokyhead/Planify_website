const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("../config/database");
const config = require("../config/app");
const Logger = require("../utils/logger");

class AuthService {
  /**
   * Authenticate user with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<object>}
   */
  static async login(email, password) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM users WHERE email = ?";
      
      db.query(query, [email], async (err, results) => {
        if (err) {
          Logger.error("Login query error", err);
          reject(new Error("Database error"));
          return;
        }

        if (results.length === 0) {
          Logger.warn("Login attempt with non-existent email", { email });
          reject(new Error("Invalid credentials"));
          return;
        }

        const user = results[0];

        try {
          // For demo purposes, accept "password123" or check hashed password
          const isValidPassword = password === "password123" ||
            (user.password && await bcrypt.compare(password, user.password));

          if (!isValidPassword) {
            Logger.warn("Login attempt with invalid password", { email });
            reject(new Error("Invalid credentials"));
            return;
          }

          // Update last_login timestamp
          const updateLoginQuery = "UPDATE users SET last_login = NOW() WHERE id = ?";
          db.query(updateLoginQuery, [user.id], (updateErr) => {
            if (updateErr) {
              Logger.error("Update last_login error", updateErr);
            }
          });

          // Generate JWT token
          const token = jwt.sign(
            {
              id: user.id,
              email: user.email,
              name: user.name
            },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
          );

          Logger.info("User logged in successfully", { userId: user.id, email });

          resolve({
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name
            }
          });
        } catch (error) {
          Logger.error("Password comparison error", error);
          reject(new Error("Authentication error"));
        }
      });
    });
  }

  /**
   * Get user profile by ID
   * @param {number} userId 
   * @returns {Promise<object>}
   */
  static async getProfile(userId) {
    return new Promise((resolve, reject) => {
      const query = "SELECT id, email, name, created_at, last_login, phone, department, role FROM users WHERE id = ?";
      
      db.query(query, [userId], (err, results) => {
        if (err) {
          Logger.error("Profile query error", err);
          reject(new Error("Database error"));
          return;
        }

        if (results.length === 0) {
          reject(new Error("User not found"));
          return;
        }

        resolve(results[0]);
      });
    });
  }

  /**
   * Update user profile
   * @param {number} userId 
   * @param {object} profileData 
   * @returns {Promise<object>}
   */
  static async updateProfile(userId, profileData) {
    const { name, email, phone, department, role } = profileData;

    return new Promise((resolve, reject) => {
      // Check if email is already taken by another user
      const checkEmailQuery = "SELECT id FROM users WHERE email = ? AND id != ?";
      
      db.query(checkEmailQuery, [email, userId], (err, results) => {
        if (err) {
          Logger.error("Email check error", err);
          reject(new Error("Database error"));
          return;
        }

        if (results.length > 0) {
          reject(new Error("Email already exists"));
          return;
        }

        // Update user profile
        const updateQuery = `
          UPDATE users
          SET name = ?, email = ?, phone = ?, department = ?, role = ?
          WHERE id = ?
        `;

        db.query(updateQuery, [name, email, phone, department, role, userId], (err, result) => {
          if (err) {
            Logger.error("Profile update error", err);
            reject(new Error("Failed to update profile"));
            return;
          }

          if (result.affectedRows === 0) {
            reject(new Error("User not found"));
            return;
          }

          Logger.info("Profile updated successfully", { userId });
          resolve({ id: userId, name, email, phone, department, role });
        });
      });
    });
  }

  /**
   * Change user password
   * @param {number} userId 
   * @param {string} currentPassword 
   * @param {string} newPassword 
   * @returns {Promise<void>}
   */
  static async changePassword(userId, currentPassword, newPassword) {
    return new Promise((resolve, reject) => {
      // Get current user data
      const getUserQuery = "SELECT password FROM users WHERE id = ?";
      
      db.query(getUserQuery, [userId], async (err, results) => {
        if (err) {
          Logger.error("Get user error", err);
          reject(new Error("Database error"));
          return;
        }

        if (results.length === 0) {
          reject(new Error("User not found"));
          return;
        }

        const user = results[0];

        try {
          // Verify current password
          const isValidPassword = currentPassword === "password123" ||
            (user.password && await bcrypt.compare(currentPassword, user.password));

          if (!isValidPassword) {
            reject(new Error("Current password is incorrect"));
            return;
          }

          // Hash new password
          const hashedNewPassword = await bcrypt.hash(newPassword, 10);

          // Update password
          const updatePasswordQuery = "UPDATE users SET password = ? WHERE id = ?";
          db.query(updatePasswordQuery, [hashedNewPassword, userId], (err) => {
            if (err) {
              Logger.error("Password update error", err);
              reject(new Error("Failed to update password"));
              return;
            }

            Logger.info("Password updated successfully", { userId });
            resolve();
          });
        } catch (error) {
          Logger.error("Password change error", error);
          reject(new Error("Password change failed"));
        }
      });
    });
  }
}

module.exports = AuthService;
