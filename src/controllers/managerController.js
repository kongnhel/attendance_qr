const db = require("../config/database");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * Get Attendance List with Pagination
 */
const getList = asyncHandler(async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Get total count
  db.query(
    "SELECT COUNT(*) AS total FROM attendance WHERE is_deleted = 0",
    (err, countResult) => {
      if (err) {
        logger.error("Count query error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error counting data" });
      }

      const totalRecords = countResult[0].total;
      const totalPages = Math.ceil(totalRecords / limit);

      // Validate page number
      if (page > totalPages && totalPages > 0) {
        page = totalPages;
      }

      // Get paginated records (✅ បានរួមបញ្ចូល column 'age' ត្រឹមត្រូវ)
      const sql = `
      SELECT id, name, gender, age, phone, place, 
             DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+07:00'), '%Y-%m-%d') as date,
             DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+07:00'), '%H:%i:%s') as time
      FROM attendance
      WHERE is_deleted = 0
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `;

      db.query(sql, [limit, offset], (err, results) => {
        if (err) {
          logger.error("List query error:", err);
          return res
            .status(500)
            .json({ success: false, message: "Error fetching data" });
        }

        res.render("manager_list", {
          records: results,
          currentPage: page,
          totalPages: totalPages,
          totalRecords: totalRecords,
          // ✅ ការពារការគាំង Server: បើមាន function csrfToken() គឺហៅប្រើ បើគ្មានទេបោះ String ទទេ ""
          csrfToken: typeof req.csrfToken === "function" ? req.csrfToken() : "",
        });
      });
    },
  );
});

/**
 * Create Attendance Record
 */
const createRecord = asyncHandler(async (req, res) => {
  // ✅ បានបន្ថែមចាប់យកតម្លៃ 'age' ពី body
  const { name, gender, age, phone, place } = req.body;

  // ✅ បន្ថែម column 'age' ទៅក្នុងកូដ SQL Insert
  const sql = `
    INSERT INTO attendance (name, gender, age, phone, place, created_at, is_deleted)
    VALUES (?, ?, ?, ?, ?, NOW(), 0)
  `;

  db.query(sql, [name, gender, age, phone, place], (err, result) => {
    if (err) {
      logger.error("Create record error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to create record",
      });
    }

    logger.info("Record created", {
      name,
      phone,
      adminId: req.session.adminId,
    });

    res.status(201).json({
      success: true,
      message: "Record created successfully",
      recordId: result.insertId,
    });
  });
});

/**
 * Update Attendance Record
 */
const updateRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // ✅ បានបន្ថែមចាប់យកតម្លៃ 'age' ពី body សម្រាប់កែប្រែ
  const { name, gender, age, phone, place } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid record ID",
    });
  }

  // ✅ បន្ថែម column 'age' ទៅក្នុងកូដ SQL Update
  const sql = `
    UPDATE attendance
    SET name = ?, gender = ?, age = ?, phone = ?, place = ?
    WHERE id = ? AND is_deleted = 0
  `;
  

  db.query(sql, [name, gender, age, phone, place, id], (err, result) => {
    if (err) {
      logger.error("Update record error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update record",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    logger.info("Record updated", {
      recordId: id,
      adminId: req.session.adminId,
    });

    res.json({
      success: true,
      message: "Record updated successfully",
    });
  });
});

/**
 * Soft Delete Attendance Record
 */
const deleteRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid record ID",
    });
  }

  const sql = `
    UPDATE attendance
    SET is_deleted = 1, deleted_at = NOW()
    WHERE id = ? AND is_deleted = 0
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      logger.error("Delete record error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete record",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Record not found or already deleted",
      });
    }

    logger.warn("Record deleted (soft)", {
      recordId: id,
      adminId: req.session.adminId,
    });

    res.json({
      success: true,
      message: "Record deleted successfully",
    });
  });
});

/**
 * Export All Attendance Records (no pagination)
 */
const exportAll = asyncHandler(async (req, res) => {
  const sql = `
    SELECT id, name, gender, age, phone, place,
           DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+07:00'), '%Y-%m-%d') as date,
           DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+07:00'), '%H:%i:%s') as time
    FROM attendance
    WHERE is_deleted = 0
    ORDER BY created_at ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      logger.error("Export query error:", err);
      return res.status(500).json({ success: false, message: "Export failed" });
    }
    res.json({ success: true, records: results });
  });
});

module.exports = {
  getList,
  createRecord,
  updateRecord,
  deleteRecord,
  exportAll,
};