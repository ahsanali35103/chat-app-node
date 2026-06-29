const crypto = require('crypto');
const { asyncHandler } = require('../Validate');

/**
 * Generate a secure custom invitation token
 * Uses HMAC with INVITATION_SECRET and includes timestamp for uniqueness
 * Token format: HMAC(email:workspaceId:timestamp):timestamp:version
 */
const generateToken = (email, workspaceId) => {
    const secret = process.env.INVITATION_SECRET;
    const timestamp = Date.now().toString();
    const version = '1';
    
    // Create HMAC with email, workspaceId, and timestamp
    const hmac = crypto
        .createHmac('sha256', secret)
        .update(`${email}:${workspaceId}:${timestamp}`)
        .digest('hex');
    
    // Combine into custom token format
    return `${hmac}:${timestamp}:${version}`;
};

/**
 * Middleware to generate invitation tokens
 * Attaches generateToken function to request for use by other middleware
 */
const checkGenerateToken = asyncHandler(async (req, res, next) => {
    // Attach the generateToken function to request object
    req.generateToken = generateToken;
    next();
});

module.exports = {
    generateToken,
    checkGenerateToken
};
