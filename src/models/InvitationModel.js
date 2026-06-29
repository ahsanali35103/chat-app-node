const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: [true, 'Workspace ID is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    token: {
        type: String,
        required: [true, 'Invitation token is required'],
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired'],
        default: 'pending'
    },
    inviterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Inviter ID is required']
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiration date is required']
    }
}, {
    timestamps: true
});

// Add instance method to check if invitation is expired
invitationSchema.methods.isExpired = function() {
    return this.expiresAt < new Date();
};

// Add pre-save middleware to prevent duplicate pending invitations
invitationSchema.pre('save', async function(next) {
    if (this.isNew && this.status === 'pending') {
        const existingInvitation = await this.constructor.findOne({
            workspaceId: this.workspaceId,
            email: this.email,
            status: 'pending'
        });
        
        if (existingInvitation) {
            const error = new Error('Pending invitation already exists for this email and workspace');
            error.code = 'DUPLICATE_INVITATION';
            return next(error);
        }
    }
    next();
});

module.exports = mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);
