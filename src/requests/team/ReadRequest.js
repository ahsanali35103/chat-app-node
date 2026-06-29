const Joi = require('joi');

const readRequest = Joi.object({
    team_id: Joi.string().required()
});

module.exports = readRequest;
