const Joi = require('joi');

const createWorkspaceSchema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().max(500).allow('', null).optional()
});

module.exports = createWorkspaceSchema;
