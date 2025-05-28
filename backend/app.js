const express = require("express");
const cors = require("cors");
const config = require("./config/app");
const { testConnection } = require("./config/database");
const Logger = require("./utils/logger");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// Import routes
const authRoutes = require("./routes/auth");
const warehouseRoutes = require("./routes/warehouses");
const storeRoutes = require("./routes/stores");
const contractRoutes = require("./routes/contracts");
const optimizationRoutes = require("./routes/optimization");
const dashboardRoutes = require("./routes/dashboard");
const exportRoutes = require("./routes/export");

// Create Express app
const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// CORS middleware
app.use(cors(config.corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use(`${config.api.prefix}/auth`, authRoutes);
app.use(`${config.api.prefix}/warehouses`, warehouseRoutes);
app.use(`${config.api.prefix}/stores`, storeRoutes);
app.use(`${config.api.prefix}/contracts`, contractRoutes);
app.use(`${config.api.prefix}/optimization`, optimizationRoutes);
app.use(`${config.api.prefix}/dashboard`, dashboardRoutes);
app.use(`${config.api.prefix}/export`, exportRoutes);

// Legacy route compatibility (for backward compatibility with existing frontend)
const legacyRoutes = express.Router();

// Legacy auth routes
legacyRoutes.post("/login", (req, res, next) => {
  req.url = '/auth/login';
  authRoutes(req, res, next);
});

legacyRoutes.get("/profile", (req, res, next) => {
  req.url = '/auth/profile';
  authRoutes(req, res, next);
});

legacyRoutes.put("/profile", (req, res, next) => {
  req.url = '/auth/profile';
  authRoutes(req, res, next);
});

legacyRoutes.put("/change-password", (req, res, next) => {
  req.url = '/auth/change-password';
  authRoutes(req, res, next);
});

// Legacy warehouse routes
legacyRoutes.get("/get-warehouses", (req, res, next) => {
  req.url = '/warehouses';
  warehouseRoutes(req, res, next);
});

legacyRoutes.get("/get-warehouse/:id", (req, res, next) => {
  req.url = `/warehouses/${req.params.id}`;
  warehouseRoutes(req, res, next);
});

legacyRoutes.post("/add-warehouse", (req, res, next) => {
  req.url = '/warehouses';
  req.method = 'POST';
  warehouseRoutes(req, res, next);
});

legacyRoutes.put("/update-warehouse/:id", (req, res, next) => {
  req.url = `/warehouses/${req.params.id}`;
  warehouseRoutes(req, res, next);
});

legacyRoutes.delete("/delete-warehouse/:id", (req, res, next) => {
  req.url = `/warehouses/${req.params.id}`;
  warehouseRoutes(req, res, next);
});

// Legacy store routes
legacyRoutes.get("/get-stores", (req, res, next) => {
  req.url = '/stores';
  storeRoutes(req, res, next);
});

legacyRoutes.get("/get-store/:id", (req, res, next) => {
  req.url = `/stores/${req.params.id}`;
  storeRoutes(req, res, next);
});

legacyRoutes.post("/add-store", (req, res, next) => {
  req.url = '/stores';
  req.method = 'POST';
  storeRoutes(req, res, next);
});

legacyRoutes.put("/update-store/:id", (req, res, next) => {
  req.url = `/stores/${req.params.id}`;
  storeRoutes(req, res, next);
});

legacyRoutes.delete("/delete-store/:id", (req, res, next) => {
  req.url = `/stores/${req.params.id}`;
  storeRoutes(req, res, next);
});

// Legacy contract routes
legacyRoutes.get("/get-contracts", (req, res, next) => {
  req.url = '/contracts';
  contractRoutes(req, res, next);
});

legacyRoutes.get("/get-contract/:id", (req, res, next) => {
  req.url = `/contracts/${req.params.id}`;
  contractRoutes(req, res, next);
});

legacyRoutes.post("/add-contract", (req, res, next) => {
  req.url = '/contracts';
  req.method = 'POST';
  contractRoutes(req, res, next);
});

legacyRoutes.put("/update-contract/:id", (req, res, next) => {
  req.url = `/contracts/${req.params.id}`;
  contractRoutes(req, res, next);
});

legacyRoutes.delete("/delete-contract/:id", (req, res, next) => {
  req.url = `/contracts/${req.params.id}`;
  contractRoutes(req, res, next);
});

// Legacy optimization routes
legacyRoutes.post("/calculate-distances", (req, res, next) => {
  req.url = '/optimization/calculate-distances';
  optimizationRoutes(req, res, next);
});

legacyRoutes.post("/generate-schedule", (req, res, next) => {
  req.url = '/optimization/generate-schedule';
  optimizationRoutes(req, res, next);
});

legacyRoutes.get("/optimization-runs", (req, res, next) => {
  req.url = '/optimization/runs';
  optimizationRoutes(req, res, next);
});

legacyRoutes.get("/schedules/:week/:year", (req, res, next) => {
  req.url = `/optimization/schedules/${req.params.week}/${req.params.year}`;
  optimizationRoutes(req, res, next);
});

legacyRoutes.get("/test-schedule", (req, res, next) => {
  req.url = '/optimization/test-schedule';
  optimizationRoutes(req, res, next);
});

// Legacy dashboard routes
legacyRoutes.get("/dashboard-stats", (req, res, next) => {
  req.url = '/dashboard/stats';
  dashboardRoutes(req, res, next);
});

// Legacy export routes
legacyRoutes.post("/export-schedule", (req, res, next) => {
  req.url = '/export/schedule';
  exportRoutes(req, res, next);
});

// Test endpoints for backward compatibility
legacyRoutes.get("/test", (req, res) => {
  Logger.info("Test endpoint called");
  res.json({ 
    success: true,
    message: "Test endpoint working!",
    timestamp: new Date().toISOString()
  });
});

legacyRoutes.get("/test-contract", (req, res) => {
  Logger.info("Test contract endpoint called");
  res.json({ 
    success: true,
    message: "Test contract endpoint working!",
    timestamp: new Date().toISOString()
  });
});

legacyRoutes.get("/test-param/:id", (req, res) => {
  Logger.info("Test param endpoint called", { id: req.params.id });
  res.json({ 
    success: true,
    message: "Test param endpoint working!", 
    id: req.params.id,
    timestamp: new Date().toISOString()
  });
});

// Mount legacy routes
app.use(config.api.prefix, legacyRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Initialize database connection
const initializeApp = async () => {
  try {
    await testConnection();
    Logger.info("Application initialized successfully");
  } catch (error) {
    Logger.error("Failed to initialize application", error);
    process.exit(1);
  }
};

// Initialize on startup
initializeApp();

module.exports = app;
