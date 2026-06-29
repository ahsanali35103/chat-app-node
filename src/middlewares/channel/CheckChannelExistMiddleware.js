const mongoose = require('mongoose');
const Channel = require('../../models/ChannelModel');
const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');


const channelExist = asyncHandler(async (req, res, next) => {
    const data = req.validatedData;

    if (!data) {
        return next(createError('Invalid request data.', 400));
    }

    const { channel_id, user_id, workspace_id } = data;

    if (channel_id) {
        if (!mongoose.Types.ObjectId.isValid(channel_id)) {
            return next(createError('Invalid channel ID format.', 400));
        }

        const channel = await Channel.findById(channel_id);
        if (!channel) {
            return next(createError('Channel not found.', 404));
        }

        req.channel = channel;
        return next();
    }

    if (user_id) {
        const normalizedUserId = String(user_id);
        const channels = await Channel.find({ 'members.user_id': normalizedUserId });
        req.channels = channels || [];
        return next();
    }

    if (workspace_id) {
        if (!mongoose.Types.ObjectId.isValid(workspace_id)) {
            return next(createError('Invalid workspace ID format.', 400));
        }

        // Fetching all channels in the workspace
        const channels = await Channel.find({ workspace_id });
        req.channels = channels || [];
        return next();
    }

    return next(createError('channel_id, workspace_id, or user_id is required.', 400));
});

module.exports = channelExist;


