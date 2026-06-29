const logger = require('../utils/Logger');

/**
 * Sensitive fields to sanitize from logs
 */
const SENSITIVE_FIELDS = ['password', 'token', 'access_token', 'refreshToken', 'refresh_token', 'resetToken', 'verifyToken', 'verify_token'];
const BLOCKED_FIELDS = ['file', 'files', 'attachment', 'attachments', 'raw'];

/**
 * Sanitize sensitive fields from object
 */
const sanitize = (value, depth = 0) => {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (depth > 2) return '[Sanitized]';
  if (Array.isArray(value)) {
    return value.map(item => sanitize(item, depth + 1));
  }

  const sanitized = {};

  Object.entries(value).forEach(([key, item]) => {
    const normalizedKey = key.toLowerCase();

    if (SENSITIVE_FIELDS.includes(normalizedKey) || normalizedKey.includes('password') || normalizedKey.includes('token')) {
      sanitized[key] = '*****';
      return;
    }

    if (BLOCKED_FIELDS.includes(normalizedKey)) {
      return;
    }

    sanitized[key] = sanitize(item, depth + 1);
  });

  return sanitized;
};

/**
 * Global Logger Middleware
 * Logs every request/response with structured data to MongoDB and console
 */
const loggerMiddleware = (req, res, next) => {
  const { method, url, ip, body } = req;
  const startTime = process.hrtime();

  // Log Outgoing Response (and request data) on Finish
  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const responseTimeMs = Math.round(diff[0] * 1e3 + diff[1] * 1e-6); // Structured response_time as number
    const { statusCode } = res;
    
    const sanitizedBody = sanitize(body);

    const logData = {
      message: `${method} ${url} - Status: ${statusCode} - Time: ${responseTimeMs}ms`,
      method,
      url,
      status: statusCode,
      ip,
      user_id: req.user ? req.user._id : null,
      request_body: sanitizedBody,
      response_time: responseTimeMs
    };

    if (statusCode >= 400) {
      logger.warn(logData);
    } else {
      logger.info(logData);
    }
  });

  next();
};

module.exports = loggerMiddleware;
