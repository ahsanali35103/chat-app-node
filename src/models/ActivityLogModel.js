const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['info', 'error', 'warn'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    method: {
        type: String
    },
    url: {
        type: String
    },
    status: {
        type: Number
    },
    ip: {
        type: String
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    request_body: {
        type: Object
    },
    response_time: {
        type: Number
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'activities'
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
