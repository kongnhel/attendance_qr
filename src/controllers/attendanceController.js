const db = require("../config/database");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * Check for duplicate attendance
 */
const checkDuplicate = (phone, callback) => {
  const sql = `
    SELECT id FROM attendance 
    WHERE phone = ? AND DATE(created_at) = CURDATE() AND is_deleted = 0
    LIMIT 1
  `;
  db.query(sql, [phone], callback);
};

/**
 * Submit Attendance Form
 */
const submitAttendance = asyncHandler(async (req, res) => {
  // ✅ បន្ថែម age ទៅក្នុងការ destructure req.body
  const { name, gender, age, phone, place } = req.body;

  // Check for duplicate
  checkDuplicate(phone, (err, results) => {
    if (err) {
      logger.error("Duplicate check error:", err);
      return res.render("success", {
        success: false,
        message: "An error occurred",
      });
    }

    if (results.length > 0) {
      logger.warn("Duplicate attendance attempt", { phone });
      return res.render("success", {
        success: false,
        message: "You have already checked in today",
      });
    }

    // ✅ បន្ថែម age ទៅក្នុង SQL Query
    const sql = `
      INSERT INTO attendance (name, gender, age, phone, place, created_at, is_deleted)
      VALUES (?, ?, ?, ?, ?, NOW(), 0)
    `;

    // ✅ បន្ថែម age ទៅក្នុង array នៃ values
    db.query(sql, [name, gender, age, phone, place], (err, result) => {
      if (err) {
        logger.error("Attendance insert error:", err);
        return res.render("success", {
          success: false,
          message: "Failed to save attendance",
        });
      }

      logger.info("Attendance recorded", {
        name,
        age,
        phone,
        place,
        recordId: result.insertId,
      });

      res.render("success", {
        success: true,
        message: `ស្វាគមន៍ ${name}! វត្តមានរបស់អ្នកត្រូវបានកត់ត្រារួចរាល់។`,
        name,
      });
    });
  });
});

/**
 * Get QR Code Page
 */
const getQRPage = asyncHandler(async (req, res) => {
  const qrcode = require("qrcode");
  const config = require("../config/env");

  try {
    const formUrl = `http://${config.APP_HOST}:${config.PORT}/scan`;
    const qrCodeDataUrl = await qrcode.toDataURL(formUrl);

    res.render("manager_qr", { qrCodeDataUrl });
  } catch (err) {
    logger.error("QR code generation error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate QR code" });
  }
});

/**
 * Get Scan Form Page
 */
// src/controllers/attendanceController.js

const getFormPage = (req, res) => {
  // ត្រួតពិនិត្យថា req.csrfToken មានមុខងារនេះពិតប្រាកដ
  const token = typeof req.csrfToken === 'function' ? req.csrfToken() : null;
  
  res.render("form", { 
    csrfToken: token 
  });
};

/**
 * Get Success Page
 */
const getSuccessPage = asyncHandler(async (req, res) => {
  res.render("success");
});

// សំខាន់៖ កុំប្រើ exports.getFormPage នៅខាងលើ
// ប្រើតែ module.exports តែមួយគត់នៅខាងក្រោមនេះ៖
module.exports = {
  submitAttendance,
  getQRPage,
  getFormPage,
  getSuccessPage,
  checkDuplicate,
};
