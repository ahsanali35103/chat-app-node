const Channel = require('../models/ChannelModel');
const ChannelResource = require('../resources/ChannelResource');
const { asyncHandler } = require('../middlewares/Validate');

const uniqueIds = (arr) => Array.from(new Set((arr || []).map(id => id.toString())));
const channelMemberIds = (channel) => (channel.members || []).map(m => m.user_id.toString());
/**
 * @desc    Create a new channel
 * @route   POST /api/channels/create
 */
const create = asyncHandler(async (req, res) => {
    const channel = await Channel.create(req.channelData);
 req.event = {
        eventName: 'channel_created',
        module: 'channel',
        operation: 'create',
        referenceId: channel._id,
        userIds: channelMemberIds(channel),
        metadata: { channel: ChannelResource.make(channel) }
    };
    res.success({
        message: 'Channel created successfully.',
        channel: ChannelResource.make(channel)
    }, 201);
});

/**
 * @desc    Get channel details
 * @route   GET /api/channels/read
 */
const read = asyncHandler(async (req, res) => {
    if (req.channels) {
        return res.success({
            channels: req.channels.map(channel => ChannelResource.make(channel))
        });
    }

    res.success({
        channel: ChannelResource.make(req.channel)
    });
});

/**
 * @desc    Update a channel
 * @route   PATCH /api/channels/update
 */
const update = asyncHandler(async (req, res) => {
    const channel = req.channel;
    const { name } = req.validatedData;

    if (name) channel.name = name;
    await channel.save();

    req.event = {
        eventName: 'channel_updated',
        module: 'channel',
        operation: 'update',
        referenceId: channel._id,
        userIds: channelMemberIds(channel),
        metadata: { channel: ChannelResource.make(channel) }
    };
    res.success({
        message: 'Channel updated successfully.',
        channel: ChannelResource.make(channel)
    });
});

/**
 * @desc    Delete a channel
 * @route   DELETE /api/channels/delete
 */
const deleteChannel = asyncHandler(async (req, res) => {
    await req.channel.deleteOne();
req.event = {
        eventName: 'channel_deleted',
        module: 'channel',
        operation: 'delete',
        referenceId: req.channel._id,
        userIds: channelMemberIds(req.channel),
        metadata: { channelId: req.channel._id.toString() }
    };
    res.success({
        message: 'Channel deleted successfully.'
    });
});

/**
 * @desc    Add member to channel
 * @route   POST /api/channels/add-member
 */
const addMember = asyncHandler(async (req, res) => {
    const channel = req.channel;
    channel.members = req.members;
    await channel.save();

    const addedUserId = req.validatedData && req.validatedData.user_id ? req.validatedData.user_id.toString() : null;
    req.event = {
        eventName: 'channel_member_added',
        module: 'channel',
        operation: 'member_added',
        referenceId: channel._id,
        userIds: channelMemberIds(channel),
        metadata: {
            channel: ChannelResource.make(channel),
            channelId: channel._id.toString(),
            workspaceId: channel.workspace_id ? channel.workspace_id.toString() : undefined,
            teamId: channel.team_id ? channel.team_id.toString() : undefined,
            addedUserId
        }
    };
    res.success({
        message: 'Member added successfully.',
        channel: ChannelResource.make(channel)
    });
});

/**
 * @desc    Remove member from channel
 * @route   DELETE /api/channels/remove-member
 */
const removeMember = asyncHandler(async (req, res) => {
    const channel = req.channel;
    channel.members = req.members;
    await channel.save();

    const removedUserId = req.validatedData && req.validatedData.user_id ? req.validatedData.user_id.toString() : null;
    const recipients = uniqueIds([...channelMemberIds(channel), ...(removedUserId ? [removedUserId] : [])]);

    req.event = {
        eventName: 'channel_member_removed',
        module: 'channel',
        operation: 'member_removed',
        referenceId: channel._id,
        userIds: recipients,
        metadata: {
            channel: ChannelResource.make(channel),
            channelId: channel._id.toString(),
            workspaceId: channel.workspace_id ? channel.workspace_id.toString() : undefined,
            teamId: channel.team_id ? channel.team_id.toString() : undefined,
            removedUserId
        }
    };
    res.success({
        message: 'Member removed successfully.',
        channel: ChannelResource.make(channel)
    });
});

module.exports = {
    create,
    read,
    update,
    deleteChannel,
    addMember,
    removeMember
};

