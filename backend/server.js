const app = require("./app");
const config = require("./config/app");
const { closeConnection } = require("./config/database");
const Logger = require("./utils/logger");

// Start server
const server = app.listen(config.port, () => {
  Logger.info(`🚀 Server running on http://localhost:${config.port}`);
  Logger.info(`Environment: ${config.env}`);
  Logger.info(`API Base URL: http://localhost:${config.port}${config.api.prefix}`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  Logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(async () => {
    Logger.info("HTTP server closed");
    
    try {
      await closeConnection();
      Logger.info("Database connection closed");
      Logger.info("Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      Logger.error("Error during graceful shutdown", error);
      process.exit(1);
    }
  });

  // Force close after 30 seconds
  setTimeout(() => {
    Logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection', { reason, promise });
  gracefulShutdown('unhandledRejection');
});

module.exports = server;
