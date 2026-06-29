const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    module: { type: String, required: true },
    operation: { type: String, required: true },
    referenceId: { type: String, required: true },
    userIds: [{ type: String, required: true }],
    actorId: { type: String, default: 'System' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.model('Event', EventSchema);
