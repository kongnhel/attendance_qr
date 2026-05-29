const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const logger = require("../utils/logger");

/**
 * Security Headers Middleware (Helmet)
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdn.tailwindcss.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://cdn.sheetjs.com",
      ],
      scriptSrcAttr: ["'none'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.tailwindcss.com",
        "https://cdnjs.cloudflare.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
      ],
      frameSrc: ["'none'"],
      imgSrc: ["'self'", "data:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Rate Limiting Middleware
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development", // Skip in development
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", { ip: req.ip, path: req.path });
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
    });
  },
});

/**
 * Login Rate Limiter (stricter)
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again later",
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => process.env.NODE_ENV === "development",
  handler: (req, res) => {
    logger.warn("Login rate limit exceeded", { ip: req.ip });
    res.status(429).render("login", {
      error: "Too many login attempts. Please try again later.",
    });
  },
});

/**
 * CSRF Protection Middleware
 */
const csrfProtection = csrf({ cookie: { httpOnly: true, sameSite: "lax" } });

/**
 * Cookie Parser Middleware
 */
const parseCookies = cookieParser();

/**
 * Content Security Wrapper
 * Adds CSRF token to response locals for forms
 */
const addCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

module.exports = {
  securityHeaders,
  globalLimiter,
  loginLimiter,
  csrfProtection,
  parseCookies,
  addCsrfToken,
};
