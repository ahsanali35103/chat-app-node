const { asyncHandler } = require("../Validate");
const { createError } = require("../../utils/GlobalResponseHandler");

const verifyMessageOwner = asyncHandler(async (req, res, next) => {
  const message = req.message;
  const userId = req.user._id;

  if (message.senderId.toString() !== userId.toString()) {
    return next(
      createError("You are not authorized to modify this message.", 403),
    );
  }

  next();
});

module.exports = verifyMessageOwner;
