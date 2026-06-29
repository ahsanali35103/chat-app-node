const Workspace = require('../../models/WorkspaceModel');
const { asyncHandler } = require("../Validate"); 
const { createError } = require("../../utils/GlobalResponseHandler");

/**
 * @desc Verify if the current user is the creator of the workspace
 */
const checkWorkspaceCreatorTeam = asyncHandler(async (req, res, next) => {
    const workspace = await Workspace.findById(req.team.workspace_id);
    
    if (!workspace) {
        return next(createError('Workspace not found.', 404));
    }

    if (String(workspace.ownerId) !== String(req.user._id)) {
        return next(createError('Access denied. Only the workspace owner can manage teams.', 403));
    }

    req.workspace = workspace;
    next();
});

module.exports = checkWorkspaceCreatorTeam;

