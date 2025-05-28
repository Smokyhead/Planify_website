const config = require('../config/app');

// Simple logger utility
class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(data && { data })
    };

    if (config.env === 'development') {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  static info(message, data = null) {
    this.log('info', message, data);
  }

  static error(message, data = null) {
    this.log('error', message, data);
  }

  static warn(message, data = null) {
    this.log('warn', message, data);
  }

  static debug(message, data = null) {
    if (config.logging.level === 'debug') {
      this.log('debug', message, data);
    }
  }
}

module.exports = Logger;
