const bcrypt = require("bcrypt");
const db = require("../config/database");
const logger = require("../utils/logger");
const config = require("../config/env");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * Admin Login
 */
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render("login", {
      error: "Username and password are required",
    });
  }

  db.query(
    "SELECT * FROM admins WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) {
        logger.error("Login query error:", err);
        return res.render("login", { error: "Database error occurred" });
      }

      if (results.length === 0) {
        logger.warn("Failed login attempt - user not found", {
          username,
          ip: req.ip,
        });
        return res.render("login", {
          error: "Username or password is incorrect",
        });
      }

      const admin = results[0];

      try {
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
          logger.warn("Failed login attempt - wrong password", {
            username,
            ip: req.ip,
          });
          return res.render("login", {
            error: "Username or password is incorrect",
          });
        }

        // Successful login
        req.session.loggedin = true;
        req.session.username = username;
        req.session.createdAt = Date.now();
        req.session.adminId = admin.id;

        logger.info("Admin login successful", { username, ip: req.ip });

        return res.redirect("/manager/qr");
      } catch (err) {
        logger.error("Password comparison error:", err);
        return res.render("login", { error: "Authentication error" });
      }
    },
  );
});

/**
 * Admin Logout
 */
const logout = asyncHandler(async (req, res) => {
  const username = req.session.username;

  req.session.destroy((err) => {
    if (err) {
      logger.error("Session destroy error:", err);
      return res.status(500).json({ success: false, message: "Logout error" });
    }
    logger.info("Admin logout", { username });
    res.redirect("/admin/login");
  });
});

module.exports = { login, logout };
