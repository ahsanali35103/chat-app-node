const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler');

/**
 * @desc Check if members to be removed are actually in the team
 */
const checkTeamMembersInTeam = asyncHandler(async (req, res, next) => {
    const { members } = req.validatedData;

    const teamMemberIds = req.team.members.map(member => String(member));

    const missingMembers = members.filter(memberId => !teamMemberIds.includes(String(memberId)));

    if (missingMembers.length > 0) {
        return next(createError(`Members not in team: ${missingMembers.join(', ')}`, 400));
    }

    next();
});

module.exports = checkTeamMembersInTeam;
