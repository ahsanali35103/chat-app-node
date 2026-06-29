const Joi = require('joi');

const createChannelSchema = Joi.object({
    name: Joi.string().when('type', { is: 'direct', then: Joi.optional(), otherwise: Joi.required() }),
    workspace_id: Joi.string().required(),
    team_id: Joi.string().allow(null, '').optional(),
    type: Joi.string().valid('public', 'private', 'direct').required(),
    direct_user_id: Joi.string().when('type', {
        is: 'direct',
        then: Joi.required(),
        otherwise: Joi.forbidden()
    })
});

module.exports = createChannelSchema;
