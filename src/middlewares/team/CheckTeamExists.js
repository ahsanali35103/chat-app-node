const Team = require('../../models/TeamModel');
const Workspace = require('../../models/WorkspaceModel'); 
const { asyncHandler } = require("../Validate"); 
const { createError } = require("../../utils/GlobalResponseHandler");

/**
 * @desc Verify if team exists and if the user is the Team Creator OR Workspace Creator
 */
const checkTeamExists = asyncHandler(async (req, res, next) => {
    const { team_id } = req.validatedData || req.params;

    const team = await Team.findById(team_id);

    if (!team) {
        return next(createError('Team not found.', 404));
    }

    // 1. Check if user is the Team Creator
    const isTeamCreator = team.creator_id.toString() === req.user._id.toString();

    // 2. Check if user is the Workspace Owner (Optional but Recommended)
    const workspace = await Workspace.findById(team.workspace_id);
    const isWorkspaceOwner = workspace && workspace.ownerId && workspace.ownerId.toString() === req.user._id.toString();

    if (!isTeamCreator && !isWorkspaceOwner) {
        return next(createError('You do not have permission to manage this team.', 403));
    }

    req.team = team;
    req.workspace = workspace; 
    
    next();
});

module.exports = checkTeamExists;