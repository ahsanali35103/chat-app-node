const Channel = require('../../models/ChannelModel');
const Workspace = require('../../models/WorkspaceModel');
const Team = require('../../models/TeamModel');
const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');


const channelCreate = asyncHandler(async (req, res, next) => {
    const data = req.validatedData;
    const user = req.user;

    // Ensure request is authenticated
    if (!user) {
        return next(createError('Unauthorized.', 401));
    }

    // Joi already validated payload shape, but guard missing data
    if (!data) {
        return next(createError('Invalid request data.', 400));
    }

    const { name, workspace_id, team_id, type, direct_user_id } = data;
    const userId = String(user._id);

    // Channel type must be one of the supported values
    if (!['public', 'private', 'direct'].includes(type)) {
        return next(createError('Invalid channel type.', 400));
    }

    // Workspace membership is required for all channel creation flows
    if (!workspace_id) {
        return next(createError('workspace_id is required.', 400));
    }

    const workspace = req.workspace || await Workspace.findById(workspace_id);
    if (!workspace) {
        return next(createError('Workspace not found.', 404));
    }

    const workspaceMemberIds = workspace.members.map(member => String(member));
    const isWorkspaceOwner = String(workspace.ownerId) === userId;

    if (!isWorkspaceOwner && !workspaceMemberIds.includes(userId)) {
        return next(createError('User is not part of this workspace.', 403));
    }

    // Public/private channels require team membership as well
    let team = req.team;
    if (type !== 'direct') {
        if (!team_id) {
            return next(createError('team_id is required for public or private channels.', 400));
        }

        team = team || await Team.findById(team_id);
        if (!team) {
            return next(createError('Team not found.', 404));
        }

        if (String(team.workspace_id) !== String(workspace._id)) {
            return next(createError('Team does not belong to this workspace.', 400));
        }

        const teamMemberIds = team.members.map(member => String(member));
        const isTeamCreator = String(team.creator_id) === userId;

        if (!isTeamCreator && !teamMemberIds.includes(userId)) {
            return next(createError('User is not part of this team.', 403));
        }

        if (!name || name.trim().length < 3) {
            return next(createError('Channel name must be at least 3 characters.', 400));
        }

        // Enforce unique name inside workspace + team for public/private channels
        const existing = await Channel.findOne({
            name,
            workspace_id,
            team_id,
            type
        });

        if (existing) {
            return next(createError('Channel with this name already exists.', 409));
        }
    }

    const members = [{ user_id: userId, role: 'creator' }];
    let direct_id = null;

    if (type === 'direct') {
        if (team_id) {
            return next(createError('team_id is not allowed for direct channels.', 400));
        }

        if (!direct_user_id) {
            return next(createError('direct_user_id is required for direct channels.', 400));
        }

        const directUserId = String(direct_user_id);
        if (directUserId === userId) {
            return next(createError('Cannot create a direct channel with yourself.', 400));
        }

        if (!workspaceMemberIds.includes(directUserId)) {
            return next(createError('User is not part of this workspace.', 403));
        }

        const sortedIds = [userId, directUserId].sort();
        direct_id = `${sortedIds[0]}_${sortedIds[1]}`;

        const existing = await Channel.findOne({
            type: 'direct',
            workspace_id,
            direct_id
        });

        if (existing) {
            return next(createError('Direct channel already exists between these users.', 409));
        }

        members.push({ user_id: directUserId, role: 'member' });
    }

    req.channelData = {
        name: type === 'direct' ? null : name,
        workspace_id,
        team_id: type === 'direct' ? null : team_id,
        type,
        created_id: userId,
        members,
        direct_id
    };

    next();
});

module.exports = channelCreate;


