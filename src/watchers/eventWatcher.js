const Event = require('../models/EventModel');

const normalizeIds = (arr) => (arr || []).map((id) => id.toString());

function buildPayload(doc) {
  return {
    eventId: doc._id ? doc._id.toString() : undefined,
    eventName: doc.eventName,
    module: doc.module,
    operation: doc.operation,
    referenceId: doc.referenceId,
    actorId: doc.actorId || 'System',
    metadata: doc.metadata || {},
    timestamp: doc.timestamp || new Date()
  };
}

function startEventWatcher(io) {
  const stream = Event.watch([{ $match: { operationType: 'insert' } }], {
    fullDocument: 'updateLookup'
  });

  stream.on('change', (change) => {
    const doc = change.fullDocument;
    if (!doc) return;

    const recipients = normalizeIds(doc.userIds);
    if (!doc.eventName || recipients.length === 0) return;

    const payload = buildPayload(doc);
    console.log(
      `Emitting "${doc.eventName}" to users: ${recipients.join(', ')} (eventId=${payload.eventId})`
    );
    recipients.forEach((userId) => {
      io.to(userId).emit(doc.eventName, payload);
    });
  });

  stream.on('error', (err) => {
    console.error('Event watcher error:', err.message);
  });

  console.log('Event watcher active (listening to events collection).');
}

module.exports = { startEventWatcher };
