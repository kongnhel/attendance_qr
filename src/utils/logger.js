const winston = require("winston");
const path = require("path");
const config = require("../config/env");
const fs = require("fs");

// Create logs directory if it doesn't exist
if (!fs.existsSync(config.LOG_DIR)) {
  fs.mkdirSync(config.LOG_DIR, { recursive: true });
}

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "qr-attendance" },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(config.LOG_DIR, "error.log"),
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(config.LOG_DIR, "combined.log"),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

// Add console logging in development
if (config.isDevelopment()) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          }`;
        }),
      ),
    }),
  );
}

module.exports = logger;
