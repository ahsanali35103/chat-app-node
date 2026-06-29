/**
 * GlobalErrorHandler — utils/GlobalErrorHandler.js
 *   isOperational = true  → known error → respond with err.statusCode + err.message
 *   isOperational = false → unexpected crash → respond with generic 500
 *
 * Works for: auth, workspace, team, channel, messages — every module.
 */
const logger = require("./Logger");
const sendErrorToWebhook = require("./WebhookService");

const GlobalErrorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message || "Internal Server Error",
    method: req.method,
    url: req.originalUrl,
    status: err.statusCode || 500,
    ip: req.ip,
    user_id: req.user ? req.user._id : null,
    stack: err.stack,
  });

  // ── Send to webhook ───────────────────────────────────────────────────────
  // Non-blocking — fires and forgets, never delays the response
  sendErrorToWebhook(err, req);

  // ── Joi Validation Errors ─────────────────────────────────────────────────
  if (err.isJoi) {
    return res.failed(err.details[0].message, { errors: err.details }, 422);
  }

  // ── MongoDB CastError (Invalid ObjectId) ──────────────────────────────────
  if (err.name === "CastError") {
    return res.failed("Invalid ID format.", { errors: err.message }, 400);
  }

  // ── MongoDB Duplicate Key Error ───────────────────────────────────────────
  if (err.code === 11000) {
    return res.failed("Duplicate field value.", { errors: err.keyValue }, 409);
  }

  // ── GridFS File Storage Errors ────────────────────────────────────────────
  if (err.message && err.message.toLowerCase().includes("GridFs")) {
    return res.failed(
      "File storage error. Please try again.",
      { errors: err.message },
      500,
    );
  }

  // ── 400 Bad Request ───────────────────────────────────────────────────────
  if (err.statusCode === 400) {
    return res.failed(err.message, {}, 400);
  }

  // ── 401 Unauthorized ──────────────────────────────────────────────────────
  if (err.statusCode === 401) {
    return res.failed(err.message, {}, 401);
  }

  // ── 403 Forbidden ─────────────────────────────────────────────────────────
  if (err.statusCode === 403) {
    return res.failed(err.message, {}, 403);
  }

  // ── 404 Not Found ─────────────────────────────────────────────────────────
  if (err.statusCode === 404) {
    return res.failed(err.message, {}, 404);
  }

  // ── Operational Errors (isOperational = true) ─────────────────────────────
  if (err.isOperational) {
    return res.failed(err.message, {}, err.statusCode);
  }

  // ── Default — unexpected / unhandled errors ───────────────────────────────
  return res.failed("Internal Server Error", {}, 500);
};

module.exports = GlobalErrorHandler;
