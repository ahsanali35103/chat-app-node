const Joi = require("joi");

// GET /api/messages/read
// Returns paginated messages for a channel.
const readAllSchema = Joi.object({
  channelId: Joi.string().hex().length(24).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = readAllSchema;
