const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');

/**
 * Checks that the authenticated user is the owner (creator) of the workspace.
 * Requires req.workspace (set by CheckWorkspaceExistsMiddleware) and req.user.
 */
const checkWorkspaceCreator = asyncHandler(async (req, res, next) => {
    if (req.workspace.ownerId.toString() !== req.user._id.toString()) {
        return next(createError('Access denied. Only the workspace owner can perform this action.', 403));
    }

    next();
});

module.exports = checkWorkspaceCreator;


