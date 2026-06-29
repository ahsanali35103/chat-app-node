const Joi = require('joi');

const createRequest = Joi.object({
    workspace_id: Joi.string().required(),
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().max(500).allow('', null).optional()
});

module.exports = createRequest;
