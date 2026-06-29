const Joi = require('joi');

const readWorkspaceSchema = Joi.object({
    workspace_id: Joi.string().optional()
});

module.exports = readWorkspaceSchema;
