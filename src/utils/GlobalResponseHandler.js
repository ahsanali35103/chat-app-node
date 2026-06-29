// ── createError ───────────────────────────────────────────────────────────────
// Replaces: createError(message, statusCode)
// Replaces: const err = new Error(msg); err.statusCode = X; next(err);
//
// isOperational = true  → ErrorHandlerMiddleware treats it as a known error
//                         and responds with err.statusCode + err.message
// isOperational = false → ErrorHandlerMiddleware treats it as unexpected crash
//                         and responds with generic 500
const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = true;
  Error.captureStackTrace(err, createError);
  return err;
};

// ── GlobalResponseHandler middleware ─────────────────────────────────────────
const GlobalResponseHandler = (req, res, next) => {
  res.success = (message, data = {}, statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  res.failed = (message, data = {}, statusCode = 400) => {
    return res.status(statusCode).json({
      success: false,
      message,
      data,
    });
  };

  next();
};

module.exports = { GlobalResponseHandler, createError };
