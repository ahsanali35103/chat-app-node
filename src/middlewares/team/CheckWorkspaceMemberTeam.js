const Workspace = require('../../models/WorkspaceModel');
const { asyncHandler } = require("../Validate"); 
const { createError } = require("../../utils/GlobalResponseHandler");

/**
 * @desc Verify if the members being added to the team are actually members of the workspace
 */
const checkWorkspaceMemberTeam = asyncHandler(async (req, res, next) => {
    const { members } = req.validatedData;

    const workspace = await Workspace.findById(req.team.workspace_id);
    
    if (!workspace) {
        return next(createError('Workspace not found.', 404));
    }

    const workspaceMemberIds = workspace.members.map(member => String(member));
    
    const invalidMembers = members.filter(memberId => !workspaceMemberIds.includes(String(memberId)));
    
    if (invalidMembers.length > 0) {
        return next(createError('One or more members are not part of the workspace.', 400));
    }

    next();
});

module.exports = checkWorkspaceMemberTeam;

