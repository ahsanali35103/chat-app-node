const User = require('../../models/UserModel');
const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');

/**
 * Processes members for workspace addition
 * - Only accepts valid user IDs
 * - Validates user existence and verification status
 * - Adds verified users to workspace
 * - Throws errors for any failures
 */
const checkMembersExist = asyncHandler(async (req, res, next) => {
    const { members } = req.validatedData;
    const workspace = req.workspace;
    const results = [];
    const errors = [];

    for (const memberId of members) {
        try {
            const user = await User.findById(memberId);
            
            if (!user) {
                errors.push({
                    member: memberId,
                    reason: 'User ID not found.'
                });
                continue;
            }

            // Convert both to strings for consistent comparison
            const userIdStr = user._id.toString();
            const workspaceMemberIds = workspace.members.map(memberId => memberId.toString());

            if (workspaceMemberIds.includes(userIdStr)) {
                errors.push({
                    member: memberId,
                    reason: 'User is already a member of this workspace.'
                });
                continue;
            }

            // Explicit verification check
            if (user.isVerified !== true) {
                errors.push({
                    member: memberId,
                    reason: 'Cannot add unverified users to workspace.'
                });
                continue;
            }

            // Add verified user to workspace
            workspace.members.push(user._id);
            await workspace.save();

            results.push({
                member: memberId,
                status: 'added',
                message: 'User added to workspace successfully',
                userId: user._id
            });
        } catch (err) {
            errors.push({
                member: memberId,
                reason: 'Invalid user ID format.'
            });
        }
    }

    // If there are any errors, throw an error with the details
    if (errors.length > 0) {
        const error = createError('Failed to add members to workspace.', 400);
        error.errors = errors;
        return next(error);
    }

    // Attach successful results to request
    req.processedResults = results;
    req.workspace = workspace; // Updated workspace with new members
    
    next();
});

module.exports = checkMembersExist;

