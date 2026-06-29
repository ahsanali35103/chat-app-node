const Joi = require("joi");

const createMessageSchema = Joi.object({
  channelId: Joi.string().hex().length(24).required(),
  type: Joi.string().valid("text", "file").required(),
  content: Joi.when("type", {
    is: "text",
    then: Joi.string().min(1).max(5000).required(),
    otherwise: Joi.string().optional().allow(null, ""),
  }),
});

module.exports = createMessageSchema;
