const Joi = require('joi');

const deleteWorkspaceSchema = Joi.object({
    workspace_id: Joi.string().required()
});

module.exports = deleteWorkspaceSchema;
