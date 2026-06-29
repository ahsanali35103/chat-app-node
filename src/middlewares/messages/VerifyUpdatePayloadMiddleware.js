const { asyncHandler } = require("../Validate");
const { createError } = require("../../utils/GlobalResponseHandler");

const verifyUpdatePayload = asyncHandler(async (req, res, next) => {
  const message = req.message;
  const { content } = req.validatedData;

  if (message.type === "text" && !content) {
    return next(
      createError("content is required to update a text message.", 400),
    );
  }

  if (message.type === "file" && !req.file) {
    return next(
      createError("A new file is required to update a file message.", 400),
    );
  }

  next();
});

module.exports = verifyUpdatePayload;
