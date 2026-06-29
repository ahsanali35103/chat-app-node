const Joi = require('joi');

const deleteRequest = Joi.object({
    team_id: Joi.string().required()
});

module.exports = deleteRequest;
