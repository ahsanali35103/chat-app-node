const { logEvent } = require('../services/eventlogger');

const normalizeEventForLogging = (event) => {
  if (!event) return null;

  const operation = event.operation;
  const module = event.module;
  const normalized = { ...event };

  const toAnnouncement = () => ({
    ...normalized,
    eventName: 'announcement',
    metadata: {
      ...normalized.metadata,
      originalEventName: normalized.eventName
    }
  });

  if (module === 'message') {
    if (operation === 'delete' || operation === 'soft_delete') return toAnnouncement();
    return normalized;
  }

  if (module === 'workspace' || module === 'team' || module === 'channel') {
    if (operation === 'create' || operation === 'update' || operation === 'delete' || operation === 'soft_delete') {
      return toAnnouncement();
    }
  }

  return normalized;
};

const eventLoggerMiddleware = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400) return;
    if (!req.event) return;

    const actorId = req.event.actorId || (req.user && req.user._id ? req.user._id.toString() : 'System');
    const payload = { ...req.event, actorId };
    const normalized = normalizeEventForLogging(payload);
    if (!normalized) return;

    Promise.resolve(logEvent(normalized)).catch((err) => {
      console.error('Event logging failed:', err.message);
    });
  });

  next();
};

module.exports = eventLoggerMiddleware;
