const Joi = require('joi');

const addWorkspaceMemberSchema = Joi.object({
    workspace_id: Joi.string().required(),
    members: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()).min(1).required()
});

module.exports = addWorkspaceMemberSchema;
