const Workspace = require('../../models/WorkspaceModel');
const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');

/**
 * Finds a single workspace by req.body.workspace_id and attaches it to req.workspace.
 * Returns 404 if not found.
 */
const checkWorkspaceExists = asyncHandler(async (req, res, next) => {
    const id = req.body.workspace_id;
    
    if (!id) {
        return next(createError('workspace_id is required in the request body.', 400));
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
        return next(createError('Workspace not found.', 404));
    }

    req.workspace = workspace;
    next();
});

module.exports = checkWorkspaceExists;


