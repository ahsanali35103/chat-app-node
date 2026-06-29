const Joi = require('joi');

const listUserChannelsSchema = Joi.object({
    user_id: Joi.string().required()
});

module.exports = listUserChannelsSchema;
