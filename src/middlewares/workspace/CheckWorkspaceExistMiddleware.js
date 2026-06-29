const Workspace = require('../../models/WorkspaceModel');
const { asyncHandler } = require('../Validate');

/**
 * Finds all workspaces where the authenticated user is a member.
 * Attaches result to req.userWorkspaces.
 */
const checkWorkspaceExist = asyncHandler(async (req, res, next) => {
    const workspaces = await Workspace.find({ members: req.user._id });

    req.userWorkspaces = workspaces;
    next();
});

module.exports = checkWorkspaceExist;


