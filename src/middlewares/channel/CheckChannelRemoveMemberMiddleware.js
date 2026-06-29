const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');


const channelRemoveMember = asyncHandler(async (req, res, next) => {
    const channel = req.channel;
    const data = req.validatedData;

    if (!channel) {
        return next(createError('Channel not found.', 404));
    }

    if (!data || !data.user_id) {
        return next(createError('User ID is required.', 400));
    }

    if (channel.type === 'direct') {
        return next(createError('Cannot remove members from a direct channel.', 400));
    }

    const targetUserId = String(data.user_id);
    const members = channel.members.map(member => ({
        ...member,
        user_id: String(member.user_id)
    }));

    if (!members.some(member => member.user_id === targetUserId)) {
        return next(createError('User is not a member of this channel.', 404));
    }

    if (String(channel.created_id) === targetUserId) {
        return next(createError('Cannot remove the channel creator.', 403));
    }

    req.members = members.filter(member => member.user_id !== targetUserId);
    next();
});

module.exports = channelRemoveMember;


