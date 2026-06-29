const { updateFileInGridFS } = require("../../config/GridFs");
const { asyncHandler } = require("../Validate");

const handleFileUpdate = asyncHandler(async (req, res, next) => {
  const message = req.message;

  if (message.type !== "file") {
    req.updatedFile = null;
    return next();
  }

  const { buffer, originalname, mimetype } = req.file;
  req.updatedFile = await updateFileInGridFS(
    message.file.fileId,
    buffer,
    originalname,
    mimetype,
  );

  next();
});

module.exports = handleFileUpdate;
