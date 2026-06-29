const mongoose = require('mongoose');
const transporter = require('../config/Mail');
const logger = require('../utils/Logger');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifyToken: {
        type: String,
        default: null
    },
    invitationToken: {
        type: String,
        default: null
    },
    resetToken: {
        type: String,
        default: null
    },
    resetTokenExpire: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Automated Email Hooks
UserSchema.post('save', async function(doc) {
    // Send Verification Email
    if (doc.verifyToken && !doc.isVerified) {
        await transporter.sendMail({
            from: '"Support" <support@nodeapp.com>',
            to: doc.email,
            subject: 'Verify your account',
            html: `<h3>Welcome, ${doc.name}!</h3>
                   <p>Use the following token to verify your account:</p>
                   <p><strong>${doc.verifyToken}</strong></p>`
        }).catch(e => logger.error(`Verification email failed: ${e.message}`));
    }

    // Send Reset Password Email
    if (doc.resetToken && doc.isModified && (doc.isModified('resetToken') || doc._resetTokenChanged)) {
        await transporter.sendMail({
            from: '"Support" <support@nodeapp.com>',
            to: doc.email,
            subject: 'Password Reset Request',
            html: `<p>Use this token to reset your password:</p>
                   <p><strong>${doc.resetToken}</strong></p>
                   <p>Expires in 1 hour.</p>`
        }).catch(e => logger.error(`Reset email failed: ${e.message}`));
    }
});

module.exports = mongoose.model('User', UserSchema);
