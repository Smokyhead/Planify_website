const jwt = require("jsonwebtoken");
const config = require("../config/app");
const Logger = require("../utils/logger");

/**
 * Authentication middleware to verify JWT tokens
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      Logger.warn('Access attempt without token', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
      });
      return res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
    }

    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        Logger.warn('Invalid token attempt', { 
          error: err.message,
          ip: req.ip 
        });
        return res.status(403).json({ 
          success: false,
          error: 'Invalid or expired token' 
        });
      }
      
      req.user = user;
      Logger.debug('User authenticated', { userId: user.id, email: user.email });
      next();
    });
  } catch (error) {
    Logger.error('Authentication middleware error', error);
    return res.status(500).json({ 
      success: false,
      error: 'Authentication error' 
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        req.user = null;
      } else {
        req.user = user;
      }
      next();
    });
  } catch (error) {
    Logger.error('Optional auth middleware error', error);
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
