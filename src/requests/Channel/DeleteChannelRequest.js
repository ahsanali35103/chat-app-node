const Joi = require('joi');

const deleteChannelSchema = Joi.object({
    channel_id: Joi.string().required()
});

module.exports = deleteChannelSchema;
