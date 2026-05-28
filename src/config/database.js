const mysql = require("mysql2");
const config = require("./env");
const logger = require("../utils/logger");

const db = mysql.createConnection({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASS,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.connect((err) => {
  if (err) {
    logger.error("❌ MySQL Connection Error:", err.message);
    console.error("Database connection failed. Please check your .env file.");
    process.exit(1);
  }
  logger.info("✅ Connected to MySQL Database Successfully");
});

// Handle connection errors
db.on("error", (err) => {
  logger.error("Database error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    logger.error("Database connection was closed.");
  }
  if (err.code === "ERR_CON_COUNT_EXCEEDED") {
    logger.error("Database connection limit exceeded.");
  }
  if (err.code === "ECONNREFUSED") {
    logger.error("Database connection was refused.");
  }
});

module.exports = db;
