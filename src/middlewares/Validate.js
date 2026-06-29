/**
 * middlewares/validate.js
 *
 * Global validation middleware + asyncHandler for the entire application.
 * Used by every module: auth, workspace, team, channel, messages.
 *
 * asyncHandler is exported from here — no separate utils/asyncHandler.js needed.
 * Every middleware and controller imports asyncHandler from this file.
 *
 * Usage in any route:
 *   const { validate, validateQuery } = require('../middlewares/Validate');
 *
 * Usage in any middleware or controller:
 *   const { asyncHandler } = require('../middlewares/Validate');
 */
const { createError } = require("../utils/GlobalResponseHandler");

// ── asyncHandler ──────────────────────────────────────────────────────────────
// Wraps any async middleware or controller function.
// Catches thrown errors and forwards to ErrorHandlerMiddleware via next(err).
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ── validate ──────────────────────────────────────────────────────────────────
// Validates req.body against a Joi schema.
// On failure → next(createError(..., 400)) → ErrorHandlerMiddleware
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(createError(error.details[0].message, 400));
  }

  req.validatedData = value;
  next();
};

// ── validateQuery ─────────────────────────────────────────────────────────────
// Validates req.query against a Joi schema.
// On failure → next(createError(..., 400)) → ErrorHandlerMiddleware
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query);

  if (error) {
    return next(createError(error.details[0].message, 400));
  }

  req.validatedData = value;
  next();
};

module.exports = { asyncHandler, validate, validateQuery };
