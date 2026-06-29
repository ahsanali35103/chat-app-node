const crypto = require('crypto');
const Invitation = require('../models/InvitationModel');
const User = require('../models/UserModel');
const Workspace = require('../models/WorkspaceModel');
const logger = require('./Logger');

class InvitationService {
    /**
     * Generate a secure deterministic invitation token
     */
    static generateToken(email, workspaceId) {
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        return crypto
            .createHmac('sha256', secret)
            .update(`${email}:${workspaceId}`)
            .digest('hex');
    }

    /**
     * Create a new invitation
     */
    static async createInvitation(workspaceId, email, inviterId) {
        try {
            // Check if invitation already exists
            const existingInvitation = await Invitation.findOne({
                workspaceId,
                email,
                status: 'pending'
            });

            if (existingInvitation) {
                // Check if invitation is expired
                if (existingInvitation.isExpired()) {
                    // Delete expired invitation and create new one
                    logger.info(`📧 Expired invitation found for ${email}, creating new one`);
                    await Invitation.findByIdAndDelete(existingInvitation._id);
                } else {
                    // Return existing invitation (still valid)
                    logger.info(`📧 Valid invitation already exists for ${email}, returning existing invitation`);
                    return {
                        success: true,
                        invitation: existingInvitation,
                        message: 'Invitation already sent (returning existing invitation)'
                    };
                }
            }

            const token = this.generateToken(email, workspaceId);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours from now

            const invitation = await Invitation.create({
                workspaceId,
                email,
                token,
                inviterId,
                expiresAt,
                status: 'pending'
            });

            return {
                success: true,
                invitation,
                message: 'New invitation created successfully'
            };

        } catch (error) {
            throw new Error(`Failed to create invitation: ${error.message}`);
        }
    }

    /**
     * Validate invitation token
     */
    static async validateInvitation(token) {
        try {
            const invitation = await Invitation.findOne({ token, status: 'pending' })
                .populate('workspaceId')
                .populate('inviterId');

            if (!invitation) {
                throw new Error('Invalid or expired invitation token');
            }

            if (invitation.isExpired()) {
                await Invitation.findByIdAndUpdate(invitation._id, { status: 'expired' });
                throw new Error('Invitation has expired');
            }

            return {
                success: true,
                invitation
            };

        } catch (error) {
            throw new Error(`Failed to validate invitation: ${error.message}`);
        }
    }

    /**
     * Accept invitation and add user to workspace
     */
    static async acceptInvitation(token, userId, workspaceId) {
        try {
            const invitation = await Invitation.findOne({ token, status: 'pending' })
                .populate('workspaceId');

            if (!invitation) {
                throw new Error('Invalid or expired invitation token');
            }

            // Verify if workspaceId matches
            if (invitation.workspaceId._id.toString() !== workspaceId.toString()) {
                throw new Error('Invitation does not match this workspace');
            }

            if (invitation.isExpired()) {
                await Invitation.findByIdAndUpdate(invitation._id, { status: 'expired' });
                throw new Error('Invitation has expired');
            }

            const workspace = invitation.workspaceId;
            
            // Check if user is already a member
            if (workspace.members.includes(userId)) {
                await Invitation.findByIdAndUpdate(invitation._id, { status: 'accepted' });
                return {
                    success: true,
                    message: 'User is already a member of this workspace',
                    workspace
                };
            }

            // Add user to workspace
            workspace.members.push(userId);
            await workspace.save();

            // Mark invitation as accepted
            await Invitation.findByIdAndUpdate(invitation._id, { status: 'accepted' });

            return {
                success: true,
                message: 'Successfully joined workspace',
                workspace
            };

        } catch (error) {
            throw new Error(`Failed to accept invitation: ${error.message}`);
        }
    }

    /**
     * Get pending invitations for a workspace
     */
    static async getPendingInvitations(workspaceId) {
        try {
            const invitations = await Invitation.find({
                workspaceId,
                status: 'pending'
            }).populate('inviterId', 'name email');

            return {
                success: true,
                invitations
            };

        } catch (error) {
            throw new Error(`Failed to get pending invitations: ${error.message}`);
        }
    }

    /**
     * Clean up expired invitations
     */
    static async cleanupExpiredInvitations() {
        try {
            const result = await Invitation.updateMany(
                { 
                    status: 'pending',
                    expiresAt: { $lt: new Date() }
                },
                { status: 'expired' }
            );

            return {
                success: true,
                expiredCount: result.modifiedCount
            };

        } catch (error) {
            throw new Error(`Failed to cleanup expired invitations: ${error.message}`);
        }
    }
}

module.exports = InvitationService;
