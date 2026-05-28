const logger = require("../utils/logger");

/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 */
const errorHandler = (err, req, res, next) => {
  logger.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Validation errors
  if (err.status === 400) {
    return res.status(400).json({
      success: false,
      message: err.message || "Validation failed",
      errors: err.errors,
    });
  }

  // Authentication errors
  if (err.status === 401) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Authorization errors
  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  // Not found errors
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      message: "Resource not found",
    });
  }

  // Database errors
  if (err.code && err.code.startsWith("ER_")) {
    return res.status(500).json({
      success: false,
      message: "Database error occurred",
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
