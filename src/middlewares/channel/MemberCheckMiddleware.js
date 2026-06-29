const Workspace = require('../../models/WorkspaceModel');
const Team = require('../../models/TeamModel');
const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');

const memberCheck = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const data = req.validatedData;

    if (!user) {
        return next(createError('Unauthorized.', 401));
    }

    if (!data) {
        return next(createError('Invalid request data.', 400));
    }

    const { workspace_id, team_id, type } = data;
    if (!workspace_id) {
        return next(createError('workspace_id is required.', 400));
    }

    const workspace = await Workspace.findById(workspace_id);
    if (!workspace) {
        return next(createError('Workspace not found.', 404));
    }

    const userId = String(user._id);
    const workspaceMemberIds = workspace.members.map(member => String(member));
    const isWorkspaceOwner = String(workspace.ownerId) === userId;

    if (!isWorkspaceOwner && !workspaceMemberIds.includes(userId)) {
        return next(createError('User is not part of this workspace.', 403));
    }

    req.workspace = workspace;

    if (type === 'direct') {
        return next();
    }

    if (!team_id) {
        return next(createError('team_id is required for public or private channels.', 400));
    }

    const team = await Team.findById(team_id);
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

    req.team = team;
    next();
});

module.exports = memberCheck;

