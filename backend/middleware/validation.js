const { validateRequiredFields } = require("../utils/helpers");
const Logger = require("../utils/logger");

/**
 * Validation middleware factory
 * @param {string[]} requiredFields - Array of required field names
 * @returns {function} Express middleware function
 */
const validateFields = (requiredFields) => {
  return (req, res, next) => {
    try {
      const { isValid, missingFields } = validateRequiredFields(req.body, requiredFields);
      
      if (!isValid) {
        Logger.warn('Validation failed', {
          missingFields,
          url: req.url,
          method: req.method,
          userId: req.user?.id
        });
        
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
          missingFields
        });
      }
      
      next();
    } catch (error) {
      Logger.error('Validation middleware error', error);
      return res.status(500).json({
        success: false,
        error: "Validation error"
      });
    }
  };
};

/**
 * Email validation middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format"
      });
    }
  }
  
  next();
};

/**
 * Password strength validation middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const validatePassword = (req, res, next) => {
  const { password, newPassword } = req.body;
  const passwordToValidate = newPassword || password;
  
  if (passwordToValidate) {
    if (passwordToValidate.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long"
      });
    }
  }
  
  next();
};

/**
 * GPS coordinates validation middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const validateGPS = (req, res, next) => {
  const { gps_lat, gps_lng } = req.body;
  
  if (gps_lat !== undefined || gps_lng !== undefined) {
    const lat = parseFloat(gps_lat);
    const lng = parseFloat(gps_lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: "Invalid GPS coordinates format"
      });
    }
    
    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        error: "Latitude must be between -90 and 90"
      });
    }
    
    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        error: "Longitude must be between -180 and 180"
      });
    }
  }
  
  next();
};

/**
 * Numeric validation middleware factory
 * @param {string[]} numericFields - Array of field names that should be numeric
 * @returns {function} Express middleware function
 */
const validateNumeric = (numericFields) => {
  return (req, res, next) => {
    const invalidFields = [];
    
    numericFields.forEach(field => {
      const value = req.body[field];
      if (value !== undefined && (isNaN(value) || value < 0)) {
        invalidFields.push(field);
      }
    });
    
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid numeric values",
        invalidFields
      });
    }
    
    next();
  };
};

module.exports = {
  validateFields,
  validateEmail,
  validatePassword,
  validateGPS,
  validateNumeric
};
