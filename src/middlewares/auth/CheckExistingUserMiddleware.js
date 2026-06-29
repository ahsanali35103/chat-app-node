const User = require('../../models/UserModel');
const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');

const checkExistingUser = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (email) {
        const user = await User.findOne({ email });
        if (user) {
            return next(createError('User already exists.', 400));
        }
    }
    next();
});

module.exports = checkExistingUser;


