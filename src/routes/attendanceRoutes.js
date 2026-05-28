const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const attendanceController = require("../controllers/attendanceController");
const { handleValidationErrors } = require("../middleware/validation");
const { csrfProtection } = require("../middleware/security");

/**
 * GET /scan
 * Display attendance form
 */
router.get("/", csrfProtection, attendanceController.getFormPage);
// router.get("/scan", csrfProtection, attendanceController.getFormPage);

/**
 * POST /scan/submit-attendance
 * Submit attendance form
 */
router.post(
  "/submit-attendance",
  csrfProtection, // រក្សាទុកសម្រាប់ការពារ HTML Form ធម្មតា (លក្ខខណ្ឌសុវត្ថិភាព)
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 255 })
      .withMessage("Name too long")
      .matches(/^[a-zA-Z\s\u1780-\u17FF]+$/)
      .withMessage("Name contains invalid characters"),
    body("gender")
      .notEmpty()
      .withMessage("Gender is required")
      .isIn(["male", "female", "other", "Male", "Female"]) // ✅ បន្ថែមអក្សរធំ ការពារករណី Frontend បញ្ជូនទិន្នន័យមកខុសទម្រង់
      .withMessage("Invalid gender"),
    body("age") // ✅ បានបន្ថែមការពិនិត្យផ្ទៀងផ្ទាត់អាយុ (Age Validation) សម្រាប់ទម្រង់ស្កេនវត្តមាន
      .trim()
      .notEmpty()
      .withMessage("Age is required")
      .isInt({ min: 1, max: 120 })
      .withMessage("Age must be a valid number between 1 and 120"),
    body("phone")
      .trim()
      .notEmpty()
      .withMessage("Phone is required")
      .matches(/^[0-9\-\+\s()]{7,20}$/)
      .withMessage("Invalid phone format"),
    body("place")
      .trim()
      .notEmpty()
      .withMessage("Place is required")
      .isLength({ max: 255 })
      .withMessage("Place too long"),
  ],
  handleValidationErrors,
  attendanceController.submitAttendance,
);

/**
 * GET /scan/success
 * Display success page
 */
router.get("/success", attendanceController.getSuccessPage);

module.exports = router;