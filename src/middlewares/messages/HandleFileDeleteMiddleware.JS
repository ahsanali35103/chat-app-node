const { deleteFileFromGridFS } = require("../../config/gridfs");
const { asyncHandler } = require("../Validate");

const handleFileDelete = asyncHandler(async (req, res, next) => {
  const message = req.message;

  if (message.type !== "file") return next();

  await deleteFileFromGridFS(message.file.fileId);

  next();
});

module.exports = handleFileDelete;
