const Joi = require("joi");

const readMessageSchema = Joi.object({
  channelId: Joi.string().hex().length(24).optional(),
  messageId: Joi.string().hex().length(24).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
}).or("channelId", "messageId");

module.exports = readMessageSchema;
