// Application configuration
const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "planify_secret_key_2025",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  
  // CORS configuration
  corsOptions: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    optionsSuccessStatus: 200
  },
  
  // Optimization configuration
  optimization: {
    maxDailyDistance: parseInt(process.env.MAX_DAILY_DISTANCE) || 600,
    defaultUnloadingTime: parseInt(process.env.DEFAULT_UNLOADING_TIME) || 30,
    defaultOpeningHours: process.env.DEFAULT_OPENING_HOURS || "08:00:00",
    defaultClosingHours: process.env.DEFAULT_CLOSING_HOURS || "21:00:00"
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "combined"
  },
  
  // Environment
  env: process.env.NODE_ENV || "development",
  
  // API configuration
  api: {
    prefix: "/api",
    version: "v1"
  }
};

module.exports = config;
