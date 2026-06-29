const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Automatically delete token after 1 hour (same as our JWT expiry)
    }
});

module.exports = mongoose.model('Token', TokenSchema);
