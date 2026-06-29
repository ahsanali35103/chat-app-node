const Joi = require('joi');

const resetSchema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required()
});

module.exports = resetSchema;
