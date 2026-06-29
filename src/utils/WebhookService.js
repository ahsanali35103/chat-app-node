/**
 * WebhookService — utils/WebhookService.js
 *
 * Sends structured error payloads to the configured webhook URL.
 * Used by GlobalErrorHandler and process-level error listeners in app.js.
 *
 * Features:
 *   - Strips sensitive fields (password, token, authorization) from body
 *   - Fails silently — webhook errors never break the main application flow
 *   - Can be disabled via WEBHOOK_ENABLED=false in .env
 *   - Non-blocking — does not await the webhook call in the error handler
 */

const WEBHOOK_URL =
  "https://app.whistleit.io/api/webhooks/69cfc4e010aee883cc006ef0";

// ── stripSensitiveFields ──────────────────────────────────────────────────────
// Removes password, token, authorization from request body before sending
// to the webhook. Never send sensitive user data to third-party services.
const stripSensitiveFields = (body = {}) => {
  const SENSITIVE_KEYS = [
    "password",
    "token",
    "authorization",
    "secret",
    "confirm_password",
  ];
  const cleaned = { ...body };
  SENSITIVE_KEYS.forEach((key) => {
    if (cleaned[key]) cleaned[key] = "[REDACTED]";
  });
  return cleaned;
};

// ── buildPayload ──────────────────────────────────────────────────────────────
// Builds the structured error payload from the error object and request context.
// req is optional — process-level errors (uncaughtException etc.) have no req.
const buildPayload = (err, req = null) => {
  return {
    message: err.message || "Unknown error",
    stack: err.stack || "No stack trace",
    statusCode: err.statusCode || 500,
    timestamp: new Date().toISOString(),
    route: req ? req.originalUrl : "process-level",
    method: req ? req.method : "N/A",
    body: req ? stripSensitiveFields(req.body) : {},
    params: req ? req.params : {},
    query: req ? req.query : {},
    user: req && req.user ? req.user._id : "unauthenticated",
    environment: process.env.NODE_ENV || "development",
  };
};

// ── sendErrorToWebhook ────────────────────────────────────────────────────────
// Main exported function. Called from GlobalErrorHandler and process listeners.
// Non-blocking — fires the request and does not await it.
// Fails silently — any webhook error is only logged locally.
//
// Usage:
//   sendErrorToWebhook(err, req);   // inside express middleware
//   sendErrorToWebhook(err);        // inside process.on listeners
const sendErrorToWebhook = (err, req = null) => {
  // Allow disabling webhook via WEBHOOK_ENABLED=false in .env
  if (process.env.WEBHOOK_ENABLED === "false") return;

  const payload = buildPayload(err, req);

  // Fire and forget — do not await, do not block response
  fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) {
        console.error(
          `[WebhookService] Failed to send — status: ${res.status}`,
        );
      }
    })
    .catch((webhookErr) => {
      // Fail silently — only log locally, never throw
      console.error(
        "[WebhookService] Error sending to webhook:",
        webhookErr.message,
      );
    });
};

module.exports = sendErrorToWebhook;
