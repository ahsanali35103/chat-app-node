const Joi = require('joi');

const updateChannelSchema = Joi.object({
    channel_id: Joi.string().required(),
    name: Joi.string().optional()
});

module.exports = updateChannelSchema;
