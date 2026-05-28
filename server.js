require("dotenv").config();

const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const session = require("express-session");
const morgan = require("morgan");

// Import configuration
const config = require("./src/config/env");
const db = require("./src/config/database");
const logger = require("./src/utils/logger");

// Import middleware
const {
  securityHeaders,
  globalLimiter,
  parseCookies,
  csrfProtection, // កែប្រែមកប្រើប្រាស់ចំទិសដៅតាម Route នីមួយៗវិញ
  addCsrfToken,
} = require("./src/middleware/security");
const { errorHandler } = require("./src/middleware/errorHandler");
const { isNotAdmin } = require("./src/middleware/auth");

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const managerRoutes = require("./src/routes/managerRoutes");

// Multi-language setup
const fs = require("fs");
const languages = {
  en: JSON.parse(
    fs.readFileSync(path.join(__dirname, "locales", "en.json"), "utf8"),
  ),
  km: JSON.parse(
    fs.readFileSync(path.join(__dirname, "locales", "km.json"), "utf8"),
  ),
};

// Create Express app
const app = express();
app.use(express.urlencoded({ extended: true }));

// ================= 1. SESSION SETUP (ត្រូវដាក់ខាងលើគេបង្អស់) =================
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.isProduction(), // HTTPS only in production
      httpOnly: true,
      sameSite: "strict",
      maxAge: config.SESSION_MAX_AGE,
    },
  }),
);

// ================= 2. SECURITY & BODY PARSERS =================
app.use(securityHeaders); // Helmet security headers
app.use(globalLimiter); // Rate limiting
app.use(parseCookies); // Cookie parser (required for CSRF)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // រៀបចំអានទិន្នន័យពី Form

// ================= 3. CSRF PROTECTION (ដកចេញពីលក្ខណៈ Global) =================
// 💡 សម្គាល់៖ យើងមិនប្រើ app.use(csrfProtection) ជាលក្ខណៈទូទៅទៀតទេ 
// ដើម្បីការពារកុំឱ្យវាប៉ះពាល់ដល់សំណើ PUT/POST/DELETE ផ្ញើចេញពី Fetch API (AJAX)។
// បងអាចយក csrfProtection ទៅដាក់ការពារតាម Router ចំៗដែលជា HTML Form បាន។

// Request logging
if (config.isDevelopment()) {
  app.use(
    morgan("dev", { stream: { write: (msg) => logger.info(msg.trim()) } }),
  );
} else {
  app.use(
    morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }),
  );
}

// ================= VIEW ENGINE SETUP =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "public")));

// ================= MULTI-LANGUAGE MIDDLEWARE =================
app.use((req, res, next) => {
  // Set language from query or session
  if (req.query.lang && languages[req.query.lang]) {
    req.session.lang = req.query.lang;
  }
  if (!req.session.lang) {
    req.session.lang = "km"; // Default language
  }

  // Translation function
  res.locals.__ = (key) => {
    return languages[req.session.lang][key] || languages["en"][key] || key;
  };

  res.locals.currentLang = req.session.lang;
  next();
});

// ================= ROUTES =================

// Redirect root to manager QR page
app.get("/", (req, res) => res.redirect("/manager/qr"));

// Auth routes (ប្រសិនបើជាទម្រង់ Form សុទ្ធ អាចថែម csrfProtection ក្នុងឯកសារ Route ផ្ទាល់)
app.use("/admin", authRoutes);

// Attendance routes (public)
app.use("/scan", attendanceRoutes);
app.use("/success", (req, res) => res.redirect("/scan/success"));

// Manager routes (protected) - រាល់សំណើ CRUD តាម Fetch API នឹងដំណើរការយ៉ាងរលូន
app.use("/manager", managerRoutes);

// ================= ERROR HANDLING =================

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ================= SERVER START =================
const PORT = config.PORT;

app.listen(PORT, () => {
  const env = config.isDevelopment() ? "Development" : "Production";
  const url = `http://${config.APP_HOST}:${PORT}`;

  logger.info(`🚀 Server running on ${url} [${env} Mode]`);
  console.log("");
  console.log("================================================");
  console.log(`✅ Server is running: ${url}`);
  console.log(`📋 Admin Panel: ${url}/admin/login`);
  console.log(`📱 Attendance Form: ${url}/scan`);
  console.log(`🔍 Manager Panel: ${url}/manager/qr`);
  console.log("================================================");
  console.log("");
});

// ================= GRACEFUL SHUTDOWN =================
process.on("SIGINT", () => {
  logger.info("Server shutting down gracefully...");
  db.end((err) => {
    if (err) logger.error("Database error during shutdown:", err);
    process.exit(0);
  });
});

module.exports = app;