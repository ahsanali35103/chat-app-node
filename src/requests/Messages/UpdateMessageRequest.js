const Joi = require("joi");

const updateMessageSchema = Joi.object({
  messageId: Joi.string().hex().length(24).required(),
  content: Joi.string().min(1).max(5000).optional(),
});

module.exports = updateMessageSchema;
