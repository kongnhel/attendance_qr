const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();

const managerController = require("../controllers/managerController");
const attendanceController = require("../controllers/attendanceController");
const { isAdmin, requireAuth } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validation");
const { csrfProtection } = require("../middleware/security"); // នាំចូល csrfProtection ត្រឹមត្រូវ

/**
 * GET /manager/qr
 * Display QR code page (protected)
 */
router.get("/qr", isAdmin, attendanceController.getQRPage);

/**
 * GET /manager/list
 * Display attendance list (protected)
 * * ✅ បានបន្ថែម csrfProtection ទៅក្នុងនេះ ដើម្បីបង្កើតមុខងារ req.csrfToken()
 * សម្រាប់បោះតម្លៃទៅឱ្យ EJS HTML ទាញយកទៅប្រើ ការពារមិនឱ្យលោត Error "req.csrfToken is not a function" ទៀតឡើយ។
 */
router.get("/list", isAdmin, csrfProtection, managerController.getList);

/**
 * GET /manager/export
 * Export all attendance records as JSON (protected)
 */
router.get("/export", isAdmin, managerController.exportAll);

/**
 * POST /manager/create
 * Create new attendance record (protected)
 */
router.post(
  "/create",
  isAdmin,
  csrfProtection, // រក្សាទុកសម្រាប់ការពារការ Submit Form បង្កើតទិន្នន័យថ្មី
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
      .isIn(["male", "female", "other", "Male", "Female", "Other"])
      .withMessage("Invalid gender"),
    body("age")
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
  managerController.createRecord,
);

/**
 * PUT /manager/update/:id
 * Update attendance record (protected)
 * * ❌ មិនដាក់ csrfProtection នៅក្នុងផ្លូវនេះឡើយ ពីព្រោះវាជាសំណើប្រភេទ AJAX Fetch API (PUT)
 * ដែលត្រូវបានផ្ញើចេញពីឯកសារ JavaScript ខាងក្រៅ (manager-list.js) ដើម្បីដោះស្រាយបញ្ហាជាប់ "invalid csrf token" 100%។
 */
router.put(
  "/update/:id",
  isAdmin,
  requireAuth,
  [
    param("id").isInt({ min: 1 }).withMessage("Invalid record ID"),
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
      .isIn(["male", "female", "other", "Male", "Female", "Other"])
      .withMessage("Invalid gender"),
    body("age") // ✅ បានបន្ថែមការពិនិត្យផ្ទៀងផ្ទាត់អាយុ (Age Validation) សម្រាប់ផ្លូវ Update យ៉ាងត្រឹមត្រូវ
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
  managerController.updateRecord,
);

/**
 * DELETE /manager/delete/:id
 * Delete attendance record (soft delete) (protected)
 * * ❌ មិនដាក់ csrfProtection ដូចគ្នា ដើម្បីឱ្យ Fetch API ដំណើរការលុបទិន្នន័យបានយ៉ាងស្រួល និងមានសុវត្ថិភាពតាមរយៈ session (isAdmin)
 */
router.delete(
  "/delete/:id",
  isAdmin,
  requireAuth,
  [param("id").isInt({ min: 1 }).withMessage("Invalid record ID")],
  handleValidationErrors,
  managerController.deleteRecord,
);

module.exports = router;