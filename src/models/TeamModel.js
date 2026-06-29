const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    workspace_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

teamSchema.index({ workspace_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Team', teamSchema);
