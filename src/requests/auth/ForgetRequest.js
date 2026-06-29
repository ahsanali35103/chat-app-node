const Joi = require('joi');

const forgetSchema = Joi.object({
    email: Joi.string().email().required()
});

module.exports = forgetSchema;
