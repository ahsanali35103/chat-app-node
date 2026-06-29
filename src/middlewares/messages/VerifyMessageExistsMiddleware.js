const Message = require("../../models/MessageModel");
const { asyncHandler } = require("../Validate");
const { createError } = require("../../utils/GlobalResponseHandler");

const verifyMessageExists = asyncHandler(async (req, res, next) => {
  const { messageId } = req.validatedData;

  if (!messageId) return next();

  const message = await Message.findOne({ _id: messageId, isDeleted: false });

  if (!message) {
    return next(createError("Message not found.", 404));
  }

  req.message = message;
  next();
});

module.exports = verifyMessageExists;
