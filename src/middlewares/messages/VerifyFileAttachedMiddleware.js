const { asyncHandler } = require("../Validate");
const { createError } = require("../../utils/GlobalResponseHandler");

const verifyFileAttached = asyncHandler(async (req, res, next) => {
  const { type } = req.validatedData;

  if (type === "file" && !req.file) {
    return next(
      createError(
        'No file attached. Please upload a file when type is "file".',
        400,
      ),
    );
  }

  next();
});

module.exports = verifyFileAttached;
