const Joi = require("joi");

const deleteMessageSchema = Joi.object({
  messageId: Joi.string().hex().length(24).required(),
});

module.exports = deleteMessageSchema;
