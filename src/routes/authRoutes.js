const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const authController = require("../controllers/authController");
const { isNotAdmin } = require("../middleware/auth");
const { loginLimiter } = require("../middleware/security");
const { handleValidationErrors } = require("../middleware/validation");
const { csrfProtection } = require("../middleware/security");

/**
 * GET /admin/login
 * Display login page
 */
router.get("/login", isNotAdmin, csrfProtection, (req, res) => {
  res.render("login", { csrfToken: req.csrfToken() });
});

/**
 * POST /admin/login
 * Process login
 */
router.post(
  "/login",
  loginLimiter,
  csrfProtection,
  [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ max: 255 })
      .withMessage("Username too long"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 1 })
      .withMessage("Invalid password"),
  ],
  handleValidationErrors,
  authController.login,
);

/**
 * GET /admin/logout
 * Process logout
 */
router.get("/logout", authController.logout);

module.exports = router;
