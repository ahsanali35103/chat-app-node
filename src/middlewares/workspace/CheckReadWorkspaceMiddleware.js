const Workspace = require('../../models/WorkspaceModel');
const WorkspaceResource = require('../../resources/WorkspaceResource');
const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');

/**
 * Checks if workspace_id is in body. 
 * If yes, finds the single workspace and formats response.
 * If no, finds all user workspaces and formats response.
 */
const checkReadWorkspace = asyncHandler(async (req, res, next) => {
    if (req.body.workspace_id) {
        const workspace = await Workspace.findById(req.body.workspace_id);
        if (!workspace) {
            return next(createError('Workspace not found.', 404));
        }
        req.responseData = {
            message: 'Workspace retrieved successfully.',
            data: WorkspaceResource.make(workspace)
        };
    } else {
        const workspaces = await Workspace.find({ members: req.user._id });
        req.responseData = {
            message: 'Workspaces retrieved successfully.',
            data: WorkspaceResource.collection(workspaces)
        };
    }
    next();
});

module.exports = checkReadWorkspace;


