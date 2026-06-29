const { asyncHandler } = require("../Validate"); 
const { createError } = require("../../utils/GlobalResponseHandler");

/**
 * @desc Check if members to be added already exist in the team
 */
const checkTeamMemberExists = asyncHandler(async (req, res, next) => {
    const { members } = req.validatedData;
    
    const teamMemberIds = req.team.members.map(member => String(member));
    
    const duplicateMembers = members.filter(memberId => teamMemberIds.includes(String(memberId)));
    
    if (duplicateMembers.length > 0) {
        return next(createError(`Members already in team: ${duplicateMembers.join(', ')}`, 409));
    }

    next();
});

module.exports = checkTeamMemberExists;

