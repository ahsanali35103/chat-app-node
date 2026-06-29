const Joi = require('joi');

const removeMemberSchema = Joi.object({
    channel_id: Joi.string().required(),
    user_id: Joi.string().required()
});

module.exports = removeMemberSchema;
