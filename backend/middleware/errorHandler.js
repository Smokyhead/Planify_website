const Logger = require("../utils/logger");
const config = require("../config/app");

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  Logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let errorDetails = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errorDetails = err.details;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Invalid reference';
  }

  // Prepare error response
  const errorResponse = {
    success: false,
    error: message
  };

  // Include error details in development mode
  if (config.env === 'development') {
    errorResponse.details = {
      message: err.message,
      stack: err.stack,
      ...(errorDetails && { validation: errorDetails })
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  Logger.warn('Route not found', {
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`
  });
};

/**
 * Async error wrapper to catch async errors in route handlers
 * @param {function} fn - Async function to wrap
 * @returns {function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
