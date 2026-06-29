const Joi = require('joi');

const removeMemberRequest = Joi.object({
    team_id: Joi.string().required(),
    members: Joi.array().items(Joi.string()).min(1).required()
});

module.exports = removeMemberRequest;
