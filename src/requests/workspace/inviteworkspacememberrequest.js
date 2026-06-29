const Joi = require('joi');

const inviteWorkspaceMemberSchema = Joi.object({
    workspace_id: Joi.string().required(),
    members: Joi.array().items(Joi.string().email().required()).min(1).required()
});

module.exports = inviteWorkspaceMemberSchema;
