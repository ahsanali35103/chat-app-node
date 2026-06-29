const Joi = require('joi');

const updateRequest = Joi.object({
    team_id: Joi.string().required(),
    name: Joi.string().min(2).max(255).optional(),
    description: Joi.string().max(500).allow('', null).optional()
});

module.exports = updateRequest;
