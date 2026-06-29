const Event = require('../models/EventModel');

const normalizeIds = (arr) => (arr || []).map((id) => id.toString());

async function logEvent(data) {
  if (!data) return;

  const {
    eventName,
    module,
    operation,
    referenceId,
    userIds,
    actorId,
    metadata,
    timestamp
  } = data;

  if (!eventName || !module || !operation || !referenceId || !userIds) return;

  await Event.create({
    eventName,
    module,
    operation,
    referenceId: referenceId.toString(),
    userIds: normalizeIds(userIds),
    actorId: actorId ? actorId.toString() : 'System',
    metadata: metadata || {},
    timestamp: timestamp || new Date()
  });
}

module.exports = { logEvent };
