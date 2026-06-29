const Joi = require('joi');

const readChannelSchema = Joi.object({
    channel_id: Joi.string(),
    workspace_id: Joi.string()
}).or('channel_id', 'workspace_id');

module.exports = readChannelSchema;
