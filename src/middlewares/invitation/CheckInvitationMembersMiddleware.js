const User = require('../../models/UserModel');
const Invitation = require('../../models/InvitationModel');
const { asyncHandler } = require('../Validate');
const { createError } = require('../../utils/GlobalResponseHandler.js');
const { generateToken } = require('./CheckGenerateTokenMiddleware');

/**
 * Middleware to process member invitations for workspace
 * - Handles existing users (auto-add if verified)
 * - Creates invitations for non-existing users
 * - Prevents duplicate invitations
 * - Handles expired invitations
 * - Throws errors for any failures
 */
const checkInvitationMembers = asyncHandler(async (req, res, next) => {
    const { members } = req.validatedData;
    const workspace = req.workspace;
    const results = [];
    const errors = [];

    for (const email of members) {
        const normalizedEmail = email.toLowerCase().trim();
        
        try {
            // Check if user exists in database
            const existingUser = await User.findOne({ email: normalizedEmail });
            
            if (existingUser) {
                // User exists - handle auto-add logic
                const userIdStr = existingUser._id.toString();
                const workspaceMemberIds = workspace.members.map(memberId => memberId.toString());

                if (workspaceMemberIds.includes(userIdStr)) {
                    errors.push({
                        member: normalizedEmail,
                        reason: 'User is already a member of this workspace.'
                    });
                    continue;
                }

                // Check if user is verified
                if (!existingUser.isVerified) {
                    errors.push({
                        member: normalizedEmail,
                        reason: 'Cannot add unverified users to workspace.'
                    });
                    continue;
                }

                // Add verified existing user to workspace
                workspace.members.push(existingUser._id);
                await workspace.save();

                results.push({
                    member: normalizedEmail,
                    status: 'added',
                    message: 'Existing user added to workspace successfully',
                    userId: existingUser._id
                });
            } else {
                // User doesn't exist - create invitation
                try {
                    // Check if invitation already exists
                    const existingInvitation = await Invitation.findOne({
                        workspaceId: workspace._id,
                        email: normalizedEmail,
                        status: 'pending'
                    });

                    if (existingInvitation) {
                        // Check if invitation is expired
                        if (existingInvitation.isExpired()) {
                            // Delete expired invitation and create new one
                            console.log(`📧 Expired invitation found for ${email}, creating new one`);
                            await Invitation.findByIdAndDelete(existingInvitation._id);
                        } else {
                            errors.push({
                                member: normalizedEmail,
                                reason: 'Invitation already sent to this email.'
                            });
                            continue;
                        }
                    }

                    // Create new invitation with secure token
                    const invitationToken = generateToken(normalizedEmail, workspace._id);
                    const expiresAt = new Date();
                    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours from now

                    const invitation = await Invitation.create({
                        workspaceId: workspace._id,
                        email: normalizedEmail,
                        token: invitationToken,
                        status: 'pending',
                        inviterId: req.user._id,
                        expiresAt
                    });

                    results.push({
                        member: normalizedEmail,
                        status: 'invited',
                        message: 'Invitation created successfully',
                        invitationId: invitation._id,
                        token: invitationToken
                    });
                } catch (invitationError) {
                    if (invitationError.code === 'DUPLICATE_INVITATION') {
                        errors.push({
                            member: normalizedEmail,
                            reason: 'Invitation already sent to this email.'
                        });
                    } else {
                        errors.push({
                            member: normalizedEmail,
                            reason: 'Failed to create invitation.'
                        });
                    }
                    continue;
                }
            }
        } catch (err) {
            errors.push({
                member: normalizedEmail,
                reason: 'Error processing invitation for this email.'
            });
        }
    }

    // If there are any errors, throw an error with the details
    if (errors.length > 0) {
        const error = createError('Failed to process some invitations.', 400);
        error.errors = errors;
        return next(error);
    }

    // Attach successful results to request
    req.processedResults = results;
    req.workspace = workspace; // Updated workspace with new members
    
    next();
});

module.exports = checkInvitationMembers;
