const mysql = require("mysql2");

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "planify",
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
  timeout: parseInt(process.env.DB_TIMEOUT) || 60000,
  reconnect: true
};

// Create connection pool
const db = mysql.createPool(dbConfig);

// Test database connection
const testConnection = () => {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) {
        console.error("MySQL connection failed:", err);
        reject(err);
        return;
      }
      console.log("✅ Connected to MySQL");
      connection.release();
      resolve();
    });
  });
};

// Graceful shutdown
const closeConnection = () => {
  return new Promise((resolve) => {
    db.end(() => {
      console.log("Database connection closed");
      resolve();
    });
  });
};

module.exports = {
  db,
  testConnection,
  closeConnection
};
