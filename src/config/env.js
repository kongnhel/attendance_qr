require("dotenv").config();

module.exports = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  APP_HOST: process.env.APP_HOST || "localhost",

  // Database (supports both naming styles: DB_USER or DB_USERNAME)
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || process.env.DB_USERNAME || "root",
  DB_PASS: process.env.DB_PASS || process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || process.env.DB_DATABASE || "qr_attendance_db",
  DB_PORT: parseInt(process.env.DB_PORT) || 3306,
  DB_SSL: process.env.DB_SSLMODE === "REQUIRED",

  // Session
  SESSION_SECRET:
    process.env.SESSION_SECRET || "default_secret_change_this_immediately",
  SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE) || 3600000, // 1 hour

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 10,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_DIR: process.env.LOG_DIR || "./logs",

  // Admin
  DEFAULT_ADMIN_USERNAME: process.env.DEFAULT_ADMIN_USERNAME || "admin",
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || "admin123",

  // Validation
  isDevelopment: () => process.env.NODE_ENV === "development",
  isProduction: () => process.env.NODE_ENV === "production",
};
