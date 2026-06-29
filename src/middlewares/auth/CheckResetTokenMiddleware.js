const User = require('../../models/UserModel');
const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');

const verifyResetToken = asyncHandler(async (req, res, next) => {
    const { token } = req.body;
    
    const user = await User.findOne({ 
        resetToken: token,
        resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(createError('Invalid or expired reset token.', 400));
    }

    req.user = user;
    next();
});

module.exports = verifyResetToken;


