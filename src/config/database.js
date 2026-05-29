const mysql = require("mysql2");
const config = require("./env");
const logger = require("../utils/logger");

const connectionConfig = {
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASS,
  database: config.DB_NAME,
  port: config.DB_PORT,
  waitForConnections: true,
  connectionLimit: config.isProduction() ? 2 : 5,
  queueLimit: 0,
  idleTimeout: 60000,
};

// Aiven and other cloud databases require SSL
if (config.DB_SSL) {
  connectionConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const db = mysql.createConnection(connectionConfig);

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
