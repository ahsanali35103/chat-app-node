const { uploadFileToGridFS } = require("../../config/GridFs");
const { asyncHandler } = require("../Validate");

const handleFileUpload = asyncHandler(async (req, res, next) => {
  const { type } = req.validatedData;

  if (type !== "file") {
    req.uploadedFile = null;
    return next();
  }

  const { buffer, originalname, mimetype } = req.file;
  req.uploadedFile = await uploadFileToGridFS(buffer, originalname, mimetype);

  next();
});

module.exports = handleFileUpload;
