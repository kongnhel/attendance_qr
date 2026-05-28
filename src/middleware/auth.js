const logger = require("../utils/logger");

/**
 * Check if user is authenticated
 */
const isAdmin = (req, res, next) => {
  if (!req.session || !req.session.loggedin) {
    logger.warn("Unauthorized access attempt", {
      ip: req.ip,
      path: req.path,
    });
    return res.redirect("/admin/login");
  }

  // Check session timeout
  const sessionAge = Date.now() - (req.session.createdAt || Date.now());
  const MAX_AGE = process.env.SESSION_MAX_AGE || 3600000; // 1 hour

  if (sessionAge > MAX_AGE) {
    req.session.destroy((err) => {
      if (err) logger.error("Session destroy error:", err);
    });
    return res.redirect("/admin/login?expired=true");
  }

  next();
};

/**
 * Check if user is NOT authenticated (for login page)
 */
const isNotAdmin = (req, res, next) => {
  if (req.session && req.session.loggedin) {
    return res.redirect("/manager/qr");
  }
  next();
};

/**
 * Redirect to login if not authenticated (for API endpoints)
 */
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.loggedin) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  next();
};

module.exports = { isAdmin, isNotAdmin, requireAuth };
