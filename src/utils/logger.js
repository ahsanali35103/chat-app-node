const fs = require('fs');
const path = require('path');
const os = require('os');

const LOGS_DIR = path.join(process.cwd(), 'logs');
const COMBINED_LOG = path.join(LOGS_DIR, 'combined.log');
const ERROR_LOG = path.join(LOGS_DIR, 'error.log');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// MongoDB activity log model
const ActivityLog = require('../models/ActivityLogModel');

/**
 * Custom Logger Utility
 * Writes to local files AND shared MongoDB
 */
class Logger {
  constructor() {
    this.levels = {
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error',
    };
  }

  /**
   * Format message with timestamp and level for terminal/file
   */
  _format(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;
  }

  /**
   * Write to local log files (async, non-blocking)
   */
  _writeFile(formattedMessage, isError = false) {
    fs.appendFile(COMBINED_LOG, formattedMessage, (err) => {
      // Silently ignore file write errors to avoid terminal logs
    });

    if (isError) {
      fs.appendFile(ERROR_LOG, formattedMessage, (err) => {
        // Silently ignore file write errors to avoid terminal logs
      });
    }
  }

  /**
   * Write to MongoDB (async, non-blocking, fire-and-forget)
   */
  async _writeMongo(level, data) {
    if (!ActivityLog) return;

    const logData = {
      type: level,
      message: data.message || 'No message provided',
      method: data.method,
      url: data.url,
      status: data.status,
      ip: data.ip,
      user_id: data.user_id || null,
      request_body: data.request_body,
      response_time: data.response_time,
      created_at: data.created_at || Date.now()
    };

    try {
      await ActivityLog.create(logData);
    } catch (err) {
      // Silently ignore MongoDB write errors to avoid terminal logs
    }
  }

  info(messageOrData) {
    const data = typeof messageOrData === 'object' ? messageOrData : { message: messageOrData };
    const formatted = this._format(this.levels.INFO, data.message);
    
    this._writeFile(formatted);
    this._writeMongo(this.levels.INFO, data);
  }

  warn(messageOrData) {
    const data = typeof messageOrData === 'object' ? messageOrData : { message: messageOrData };
    const formatted = this._format(this.levels.WARN, data.message);
    
    this._writeFile(formatted);
    this._writeMongo(this.levels.WARN, data);
  }

  error(messageOrData, stack = '') {
    const data = typeof messageOrData === 'object' ? messageOrData : { message: messageOrData, stack };
    const fullMessage = data.stack ? `${data.message}\nStack: ${data.stack}` : data.message;
    const formatted = this._format(this.levels.ERROR, fullMessage);
    
    this._writeFile(formatted, true);
    this._writeMongo(this.levels.ERROR, data);
  }
}

module.exports = new Logger();
