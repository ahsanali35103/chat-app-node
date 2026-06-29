const Joi = require('joi');

const addMemberSchema = Joi.object({
    channel_id: Joi.string().required(),
    user_id: Joi.string().required()
});

module.exports = addMemberSchema;
