const User = require('../../models/UserModel');
const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');

const verifyEmailExists = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
        return next(createError('User with this email does not exist.', 404));
    }

    req.user = user;
    next();
});

module.exports = verifyEmailExists;


