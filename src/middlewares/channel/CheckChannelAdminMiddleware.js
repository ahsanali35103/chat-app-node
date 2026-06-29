const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');


const channelAdmin = asyncHandler(async (req, res, next) => {
    const channel = req.channel;
    const user = req.user;

    if (!channel) {
        return next(createError('Channel not found.', 404));
    }

    if (!user) {
        return next(createError('Unauthorized.', 401));
    }

    const userId = String(user._id);
    const creatorId = String(channel.created_id);

    if (req.route && req.route.path === '/remove-member') {
        const targetUserId = String(req.validatedData?.user_id || '');
        if (targetUserId === userId) {
            return next();
        }
    }

    if (creatorId !== userId) {
        return next(createError('Access denied. Only the channel creator can perform this action.', 403));
    }

    next();
});

module.exports = channelAdmin;


