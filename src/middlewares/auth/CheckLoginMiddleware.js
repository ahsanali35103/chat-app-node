const bcrypt = require('bcryptjs');
const User = require('../../models/UserModel');
const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');

const verifyLogin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
        return next(createError('Invalid credentials.', 400));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(createError('Invalid credentials.', 400));
    }

    if (!user.isVerified) {
        return next(createError('Please verify your email address before logging in.', 403));
    }

    req.user = user;
    next();
});

module.exports = verifyLogin;


