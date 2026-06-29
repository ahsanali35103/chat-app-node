const { asyncHandler } = require("../Validate"); 
const { createError } = require("../../utils/GlobalResponseHandler");

/**
 * @desc Filter update payload and ensure at least one field is provided
 */
const checkTeamUpdatePayload = asyncHandler(async (req, res, next) => {
    const { name, description } = req.validatedData;

    const updatePayload = {};

    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;

    if (Object.keys(updatePayload).length === 0) {
        return next(createError('At least one field (name or description) must be provided for update.', 400));
    }

    req.updatePayload = updatePayload;
    next();
});

module.exports = checkTeamUpdatePayload;

